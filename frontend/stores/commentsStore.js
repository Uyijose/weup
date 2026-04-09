import { create } from "zustand";
import { getAuthToken } from "../utils/getAuthToken.js";

export const useCommentsStore = create((set, get) => ({
  commentsMap: {},

  fetchComments: async (postId, originalPostId) => {
    const column = originalPostId ? "video_part_id" : "post_id";
    const token = await getAuthToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments?${column}=${postId}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    const data = await res.json();

    set((state) => ({
      commentsMap: {
        ...state.commentsMap,
        [postId]: data ?? [],
      },
    }));

    return data ?? [];
  },

  addComment: (postId, comment) =>
    set((state) => ({
      commentsMap: {
        ...state.commentsMap,
        [postId]: [comment, ...(state.commentsMap[postId] || [])],
      },
    })),
}));
