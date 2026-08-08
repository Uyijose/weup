import { create } from "zustand";
import { supabase } from "../lib/supabase";

type SelectedFile = {
  file: File;
};

type UploadProgressInterval = ReturnType<typeof setInterval> | null;

type UploadStore = {
  caption: string;
  topic: string;
  hashTags: string;
  tagShow: boolean;
  tagError: string;
  selectedFile: SelectedFile | null;
  uploadProgress: number;
  uploadMessage: string;
  progressInterval: UploadProgressInterval;
  redirecting: boolean;
  loading: boolean;

  setCaption: (caption: string) => void;
  setTopic: (topic: string) => void;
  setHashTags: (hashTags: string) => void;
  setSelectedFile: (file: SelectedFile | null) => void;
  resetUpload: () => void;
  clearProgressInterval: () => void;
  trackProgress: (userId: string, token: string) => Promise<void>;
  handlePost: (router: {
    push: (path: string) => void;
  }) => Promise<void>;
  uploadImage: (file: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
  }) => Promise<string | null>;
};

export const useUploadVideoStore = create<UploadStore>((set, get) => ({
  caption: "",
  topic: "Music",
  hashTags: "",
  tagShow: false,
  tagError: "",

  selectedFile: null,
  uploadProgress: 0,
  uploadMessage: "",
  progressInterval: null,
  redirecting: false,
  loading: false,

  setCaption: (caption) => {
    set({ caption });
  },

  setTopic: (topic) => {
    set({ topic });
  },

  setHashTags: (hashTags) => {
    set({ hashTags });
  },

  setSelectedFile: (file) => {
    set({ selectedFile: file });
  },

  resetUpload: () => {
    set({
      caption: "",
      topic: "Music",
      hashTags: "",
      tagShow: false,
      tagError: "",
      selectedFile: null,
      loading: false,
      uploadProgress: 0,
      uploadMessage: "",
      redirecting: false,
    });
  },

  clearProgressInterval: () => {
    const existing = get().progressInterval;

    if (existing) {
      clearInterval(existing);
      console.log("[PROGRESS] interval cleared");
    }

    set({ progressInterval: null });
  },

  trackProgress: async (userId, token) => {
    if (!token || !userId) {
      return;
    }

    const existing = get().progressInterval;

    if (existing) {
      clearInterval(existing);
    }

    const interval = setInterval(async () => {
      try {
        const sessionRefresh = await supabase.auth.getSession();
        const freshToken =
          sessionRefresh?.data?.session?.access_token;

        if (!freshToken) {
          clearInterval(interval);
          set({
            progressInterval: null,
            loading: false,
          });
          return;
        }

        const backendUrl =
          process.env.EXPO_PUBLIC_BACKEND_URL ||
          process.env.NEXT_PUBLIC_BACKEND_URL;

        const res = await fetch(
          `${backendUrl}/api/videos/progress/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${freshToken}`,
            },
          }
        );

        if (!res.ok) {
          clearInterval(interval);

          set({
            progressInterval: null,
            loading: false,
          });

          return;
        }

        const data = await res.json();

        set((state) => {
          if (
            data?.percent === 0 &&
            data?.message?.includes("failed")
          ) {
            clearInterval(interval);

            return {
              uploadProgress: 0,
              uploadMessage: data.message,
              loading: false,
              progressInterval: null,
            };
          }

          return {
            uploadProgress:
              data?.percent ?? state.uploadProgress,
            uploadMessage:
              data?.message ?? state.uploadMessage,
          };
        });

        if (data?.percent >= 100) {
          clearInterval(interval);

          set({
            progressInterval: null,
            uploadProgress: 100,
            uploadMessage: "processing complete",
          });
        }
      } catch {
        clearInterval(interval);

        set({
          progressInterval: null,
        });
      }
    }, 1000);

    set({
      progressInterval: interval,
    });
  },

  handlePost: async (router) => {
    const {
      caption,
      topic,
      hashTags,
      selectedFile,
      trackProgress,
    } = get();

    if (!selectedFile) {
      return;
    }

    if (get().loading) {
      console.log("[UPLOAD BLOCKED] already uploading");
      return;
    }

    set({
      loading: true,
    });

    try {
      const session =
        await supabase.auth.getSession();

      const token =
        session.data.session?.access_token;

      if (!token) {
        throw new Error("User is not authenticated");
      }

      const backendUrl =
        process.env.EXPO_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL;

      const uploadRes = await fetch(
        `${backendUrl}/api/upload/signed-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileType: "video",
            caption: caption || "",
            originalFileName:
              selectedFile.file.name,
          }),
        }
      );

      const uploadData =
        await uploadRes.json();

      if (
        selectedFile.file.size >
        50 * 1024 * 1024
      ) {
        throw new Error(
          "FILE_TOO_LARGE_FOR_SINGLE_UPLOAD"
        );
      }

      await new Promise<void>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open(
            "PUT",
            uploadData.uploadUrl
          );

          xhr.setRequestHeader(
            "Content-Type",
            selectedFile.file.type ||
              "video/mp4"
          );

          xhr.upload.onprogress = (
            event
          ) => {
            if (
              event.lengthComputable
            ) {
              const percent = Math.min(
                Math.floor(
                  (event.loaded /
                    event.total) *
                    10
                ),
                9
              );

              set({
                uploadProgress: percent,
                uploadMessage:
                  "uploading video",
              });
            }
          };

          xhr.onload = () => {
            if (
              xhr.status >= 200 &&
              xhr.status < 300
            ) {
              resolve();
            } else {
              reject(
                new Error(
                  "UPLOAD_FAILED"
                )
              );
            }
          };

          xhr.onerror = () => {
            reject(
              new Error("UPLOAD_FAILED")
            );
          };

          xhr.send(
            selectedFile.file
          );
        }
      );

      set({
        uploadProgress: 10,
        uploadMessage:
          "upload complete, waiting for download to begin...",
        loading: true,
      });

      const progressSession =
        await supabase.auth.getSession();

      const userId =
        progressSession.data.session?.user
          ?.id;

      const tokenForProgress =
        progressSession.data.session
          ?.access_token;

      if (
        userId &&
        tokenForProgress
      ) {
        trackProgress(
          userId,
          tokenForProgress
        );
      }

      let processRes;
      let data: any = null;

      try {
        processRes = await fetch(
          `${backendUrl}/api/videos/process`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileKey:
                uploadData.fileKey,
              caption,
              topic:
                topic === "Other"
                  ? hashTags
                  : topic,
            }),
          }
        );

        try {
          data =
            await processRes.json();
        } catch {
          data = null;
        }
      } catch {
        data = null;
      }

      set({
        uploadMessage:
          "processing video...",
      });

      const checkReadyAndRedirect =
        () => {
          const state = get();

          if (!data) {
            setTimeout(
              checkReadyAndRedirect,
              1000
            );
            return;
          }

          if (
            data.success === false
          ) {
            set({
              loading: false,
            });
            return;
          }

          if (
            state.uploadProgress <
            100
          ) {
            setTimeout(
              checkReadyAndRedirect,
              1000
            );
            return;
          }

          set({
            redirecting: true,
            uploadMessage:
              "Redirecting to your post...",
            loading: true,
          });

          if (data.hasParts) {
            router.push(
              `/posts/${data.postId}?part=1`
            );
          } else {
            router.push(
              `/posts/${data.postId}`
            );
          }
        };

      checkReadyAndRedirect();
    } catch {
      set({
        loading: false,
      });
    }
  },

  uploadImage: async (file) => {
    try {
      const session =
        await supabase.auth.getSession();

      const token =
        session.data.session?.access_token;

      if (!token) {
        throw new Error(
          "User is not authenticated"
        );
      }

      const backendUrl =
        process.env.EXPO_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL;

      const fileName =
        file.fileName ||
        `image-${Date.now()}.jpg`;

      const fileType =
        file.mimeType ||
        "image/jpeg";

      const uploadRes = await fetch(
        `${backendUrl}/api/upload/signed-url`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileType: "image",
            caption: "",
            originalFileName: fileName,
          }),
        }
      );

      if (!uploadRes.ok) {
        throw new Error(
          "Failed to get image upload URL"
        );
      }

      const uploadData =
        await uploadRes.json();

      if (!uploadData?.uploadUrl) {
        throw new Error(
          "Invalid upload URL"
        );
      }

      const response = await fetch(
        file.uri
      );

      if (!response.ok) {
        throw new Error(
          "Failed to read image"
        );
      }

      const blob =
        await response.blob();

      const uploadResponse =
        await fetch(
          uploadData.uploadUrl,
          {
            method: "PUT",
            body: blob,
            headers: {
              "Content-Type": fileType,
            },
          }
        );

      if (!uploadResponse.ok) {
        throw new Error(
          "Image upload failed"
        );
      }

      const publicBaseUrl =
        process.env.EXPO_PUBLIC_R2_PUBLIC_URL ||
        process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

      if (!publicBaseUrl) {
        throw new Error(
          "R2 public URL is not configured"
        );
      }

      return `${publicBaseUrl}/${uploadData.fileKey}`;
    } catch (error: any) {
      console.log(
        "Image upload error:",
        error?.message
      );

      return null;
    }
  },
}));