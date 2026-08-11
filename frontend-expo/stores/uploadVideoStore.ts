import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { uploadVideo } from "../services/upload.service";

type SelectedFile = {
  file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  };
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
  uploadError: string;

  setCaption: (caption: string) => void;
  setTopic: (topic: string) => void;
  setHashTags: (hashTags: string) => void;
  setSelectedFile: (file: SelectedFile | null) => void;
  setUploadError: (error: string) => void;
  resetUpload: () => void;
  clearProgressInterval: () => void;
  trackProgress: (userId: string, token: string) => Promise<void>;
  handlePost: () => Promise<{
    success: boolean;
    postId?: string;
    hasParts?: boolean;
  }>;
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
  uploadError: "",

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

  setUploadError: (error) => {
    set({ uploadError: error });
  },

  resetUpload: () => {
    const existing = get().progressInterval;

    if (existing) {
      clearInterval(existing);
    }

    console.log("[UPLOAD] State reset");

    set({
      caption: "",
      topic: "",
      hashTags: "",
      tagShow: false,
      tagError: "",
      selectedFile: null,
      loading: false,
      uploadProgress: 0,
      uploadMessage: "",
      progressInterval: null,
      redirecting: false,
      uploadError: "",
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
      console.error("[UPLOAD PROGRESS] Missing user or token");
      return;
    }

    const existing = get().progressInterval;

    if (existing) {
      clearInterval(existing);
    }

    const interval = setInterval(async () => {
      try {
        const sessionRefresh =
          await supabase.auth.getSession();

        const freshToken =
          sessionRefresh.data.session?.access_token;

        if (!freshToken) {
          clearInterval(interval);

          set({
            progressInterval: null,
            loading: false,
            uploadError: "Authentication failed.",
          });

          console.error(
            "[UPLOAD PROGRESS] Authentication failed"
          );

          return;
        }

        const backendUrl =
          process.env.EXPO_PUBLIC_BACKEND_URL ||
          process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!backendUrl) {
          clearInterval(interval);

          set({
            progressInterval: null,
            loading: false,
            uploadError: "Upload service is not configured.",
          });

          console.error(
            "[UPLOAD PROGRESS] Backend URL missing"
          );

          return;
        }

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
            uploadError:
              "Unable to get upload progress.",
          });

          console.error(
            "[UPLOAD PROGRESS] Progress request failed:",
            res.status
          );

          return;
        }

        const data = await res.json();

        console.log(
          "[UPLOAD PROGRESS]",
          data?.percent,
          data?.message
        );

        if (
          data?.percent === 0 &&
          data?.message?.toLowerCase?.().includes("failed")
        ) {
          clearInterval(interval);

          set({
            uploadProgress: 0,
            uploadMessage: data.message,
            loading: false,
            progressInterval: null,
            uploadError:
              "Unable to upload video.",
          });

          console.error(
            "[UPLOAD PROGRESS] Processing failed:",
            data.message
          );

          return;
        }

        set((state) => ({
          uploadProgress:
            data?.percent ?? state.uploadProgress,
          uploadMessage:
            data?.message ?? state.uploadMessage,
        }));

        if (data?.percent >= 100) {
          clearInterval(interval);

          set({
            progressInterval: null,
            uploadProgress: 100,
            uploadMessage: "Processing complete",
            loading: false,
          });

          console.log(
            "[UPLOAD PROGRESS] Upload completed"
          );
        }
      } catch (error) {
        clearInterval(interval);

        console.error(
          "[UPLOAD PROGRESS] Error:",
          error
        );

        set({
          progressInterval: null,
          loading: false,
          uploadError:
            "Unable to get upload progress.",
        });
      }
    }, 1000);

    set({
      progressInterval: interval,
    });
  },

  handlePost: async () => {
    const {
      caption,
      topic,
      hashTags,
      selectedFile,
      trackProgress,
    } = get();

    if (get().loading) {
      console.log(
        "[UPLOAD BLOCKED] Already uploading"
      );

      return {
        success: false,
      };
    }

    if (!selectedFile) {
      const message =
        "Please upload a video";

      set({
        uploadError: message,
      });

      console.error(
        "[UPLOAD VALIDATION]",
        message
      );

      return {
        success: false,
      };
    }

    set({
      loading: true,
      uploadError: "",
      uploadProgress: 0,
      uploadMessage: "Starting upload...",
    });

    console.log(
      "[UPLOAD] Upload started"
    );

    try {
      const session =
        await supabase.auth.getSession();

      const userId =
        session.data.session?.user?.id;

      const token =
        session.data.session?.access_token;

      if (!userId || !token) {
        throw new Error(
          "User is not authenticated"
        );
      }

      const finalTopic =
        topic === "Other"
          ? hashTags.trim()
          : topic.trim();

      console.log(
        "[UPLOAD] Topic:",
        finalTopic
      );

      const result =
        await uploadVideo(
          selectedFile.file,
          caption.trim(),
          finalTopic,
          (progress) => {
            set({
              uploadProgress: progress,
              uploadMessage:
                "Uploading video...",
            });

            console.log(
              "[UPLOAD] Upload progress:",
              progress
            );
          }
        );

      console.log(
        "[UPLOAD] Processing request completed:",
        result
      );

      set({
        uploadProgress: 10,
        uploadMessage:
          "Processing video...",
      });

      console.log(
        "[UPLOAD] Processing started"
      );

      trackProgress(
        userId,
        token
      );

      if (!result.success) {
        set({
          loading: false,
          uploadError:
            "Unable to upload video.",
        });

        console.error(
          "[UPLOAD] Upload failed"
        );

        return {
          success: false,
        };
      }

      set({
        loading: false,
        uploadProgress: 100,
        uploadMessage:
          "Processing complete",
      });

      console.log(
        "[UPLOAD] Upload completed successfully:",
        result.postId
      );

      return result;
    } catch (error: any) {
      console.error(
        "[UPLOAD FAILED]",
        error
      );

      const existing =
        get().progressInterval;

      if (existing) {
        clearInterval(existing);
      }

      set({
        loading: false,
        progressInterval: null,
        uploadError:
          error?.message ||
          "Unable to upload video.",
        uploadMessage: "",
      });

      return {
        success: false,
      };
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