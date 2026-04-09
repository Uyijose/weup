import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";

export const useUploadVideoStore = create((set, get) => ({
  caption: "",
  topic: "Music",
  hashTags: "",
  tagShow: false,
  tagError: "",

  selectedFile: null,

  loading: false,
  uploadProgress: 0,
  uploadMessage: "",

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
      uploadMessage: ""
    });
  },

  trackProgress: async (userId, token) => {
    const interval = setInterval(async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/videos/progress/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      set({
        uploadProgress: data.percent,
        uploadMessage: data.message
      });

      if (data.percent >= 100) {
        clearInterval(interval);
      }
    }, 1000);
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
      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: selectedFile.file,
        headers: {
          "Content-Type": selectedFile.file.type || "video/mp4"
        }
      });
      set({
        uploadProgress: 50,
        uploadMessage: "upload complete, processing video"
      });

      const session = await supabase.auth.getSession();
      const userId = session.data.session.user.id;

      trackProgress(userId, token);

      const processRes = await fetch(
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

      const data = await processRes.json();
      set({
        uploadProgress: 100,
        uploadMessage: "processing complete",
        loading: false
      });

      setTimeout(() => {
        router.push(data.postId ? `/posts/${data.postId}` : "/");
      }, 2000);
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
      return null;
    }
  }

}));
