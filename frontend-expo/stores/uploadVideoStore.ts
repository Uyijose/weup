import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";

export const useUploadVideoStore = create((set, get) => ({
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
      redirecting: false
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
        const sessionRefresh = await supabase.auth.getSession()
        const freshToken = sessionRefresh?.data?.session?.access_token
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/videos/progress/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${freshToken}`
            }
          }
        )
        if (!res.ok) {
          clearInterval(interval);
          set({ progressInterval: null, loading: false });
          return;
        }

        const data = await res.json();
        set((state) => {
          console.log("[PROGRESS UPDATE]", {
            current: state.uploadProgress,
            incoming: data?.percent,
            message: data?.message
          });

          if (data?.percent === 0 && data?.message?.includes("failed")) {
            console.log("[FRONTEND DETECTED FAILURE]", data);

            clearInterval(interval);

            return {
              uploadProgress: 0,
              uploadMessage: data.message,
              loading: false,
              progressInterval: null
            };
          }

          return {
            uploadProgress: data?.percent ?? state.uploadProgress,
            uploadMessage: data?.message ?? state.uploadMessage
          };
        });

        if (data?.percent >= 100) {
          console.log("[FRONTEND] backend reached 100");

          clearInterval(interval);

          set({
            progressInterval: null,
            uploadProgress: 100,
            uploadMessage: "processing complete"
          });
        }
      } catch (err) {
        clearInterval(interval);
        set({ progressInterval: null });
      }
    }, 1000);
    set({ progressInterval: interval });
  },

  handlePost: async (router) => {
    const {
      caption,
      topic,
      hashTags,
      selectedFile,
      trackProgress
    } = get();

    if (!selectedFile) {
      return;
    }

    if (get().loading) {
      console.log("[UPLOAD BLOCKED] already uploading")
      return;
    }

    set({ loading: true });

    try {
      const token =
        (await supabase.auth.getSession()).data.session.access_token;
      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/signed-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileType: "video",
            caption: caption || "",
            originalFileName: selectedFile.file.name
          })
        }
      );
      const uploadData = await uploadRes.json();
      if (selectedFile.file.size > 50 * 1024 * 1024) {
        throw new Error("FILE_TOO_LARGE_FOR_SINGLE_UPLOAD");
      }

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", uploadData.uploadUrl);

        xhr.setRequestHeader(
          "Content-Type",
          selectedFile.file.type || "video/mp4"
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(
              Math.floor((event.loaded / event.total) * 10),
              9
            );

            console.log("[UPLOAD FRONTEND]", {
              loaded: event.loaded,
              total: event.total,
              percent
            });

            set({
              uploadProgress: percent,
              uploadMessage: "uploading video"
            });
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("[UPLOAD COMPLETE]");
            resolve();
          } else {
            reject(new Error("UPLOAD_FAILED"));
          }
        };

        xhr.onerror = () => {
          reject(new Error("UPLOAD_FAILED"));
        };

        xhr.send(selectedFile.file);
      });

      console.log("[UPLOAD DONE] switching to backend progress");

      set({
        uploadProgress: 10,
        uploadMessage: "upload complete, waiting for download to begin...",
        loading: true
      });

      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id;
      const tokenForProgress = session?.data?.session?.access_token;

      if (!userId || !tokenForProgress) {
      } else {
        trackProgress(userId, tokenForProgress);
      }
      let processRes;
      let data = null;
      try {
        processRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/videos/process`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              fileKey: uploadData.fileKey,
              caption,
              topic: topic === "Other" ? hashTags : topic
            })
          }
        );
        try {
          data = await processRes.json();
        } catch (err) {
          console.log("[PROCESS] json parse failed");
        }

      } catch (err) {
        console.log("[PROCESS] request failed", err.message);
      }
      console.log("[FRONTEND] waiting for backend to reach 100");

      set({
        uploadMessage: "processing video...",
      });

      const checkReadyAndRedirect = () => {
        const state = get();

        console.log("[REDIRECT CHECK]", {
          progress: state.uploadProgress,
          hasData: !!data,
          success: data?.success
        });

        if (!data) {
          setTimeout(checkReadyAndRedirect, 1000);
          return;
        }

        if (data.success === false) {
          console.log("[REDIRECT ABORTED — BACKEND FAILED]", data);
          set({ loading: false });
          return;
        }

        if (state.uploadProgress < 100) {
          setTimeout(checkReadyAndRedirect, 1000);
          return;
        }

        console.log("[REDIRECT CONFIRMED @100%]");

        console.log("[REDIRECT CONFIRMED]");
        console.log("[UI LOCK] redirect overlay enabled");

        set({
          redirecting: true,
          uploadMessage: "Redirecting to your post...",
          loading: true
        });

        if (data.hasParts) {
          router.push(`/posts/${data.postId}?part=1`);
        } else {
          router.push(`/posts/${data.postId}`);
        }
      };

      checkReadyAndRedirect();
    } catch (err) {
      set({ loading: false });
    }
  },

  uploadImage: async (file) => {
    try {
      const token =
        (await supabase.auth.getSession()).data.session.access_token;
      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/signed-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileType: "image",
            caption: "",
            originalFileName: file.name
          })
        }
      );

      const uploadData = await uploadRes.json();
      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "image/jpeg"
        }
      });
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uploadData.fileKey}`;
      return publicUrl;
    } catch (err) {
      console.log("upload error", err.message);
      return null;
    }
  }

}));
