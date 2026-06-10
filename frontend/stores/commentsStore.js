import { create } from "zustand";
import { getAuthToken } from "../utils/getAuthToken.js";

export const useCommentsStore = create((set, get) => ({
  commentsMap: {},

  fetchComments: async (postId, videoPartId) => {
    const token = await getAuthToken();

    const keyId = videoPartId ?? postId;

    const column = videoPartId ? "video_part_id" : "post_id";
    const value = videoPartId ?? postId;

    console.log("[COMMENTS FETCH]", {
      keyId,
      column,
      value
    });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments?${column}=${value}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    const data = await res.json();

    console.log("[COMMENTS RESPONSE]", {
      keyId,
      ok: res.ok,
      count: Array.isArray(data) ? data.length : 0
    });

    set((state) => ({
      commentsMap: {
        ...state.commentsMap,
        [keyId]: Array.isArray(data) ? data : [],
      },
    }));

    return Array.isArray(data) ? data : [];
  },

  addComment: (keyId, comment) =>
  set((state) => {
    const existing = state.commentsMap[keyId];

    console.log("[COMMENT ADD]", {
      keyId,
      before: existing?.length ?? 0
    });

    return {
      commentsMap: {
        ...state.commentsMap,
        [keyId]: [comment, ...(existing || [])],
      },
    };
  }),
}));
