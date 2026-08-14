import { create } from "zustand";
import { getAuthToken } from "../utils/getAuthToken";
import { api } from "../lib/api";

type CommentsStore = {
  commentsMap: Record<string, any[]>;

  fetchComments: (
    postId: string,
    videoPartId?: string
  ) => Promise<any[]>;

  addComment: (
    keyId: string,
    comment: any
  ) => void;
};

export const useCommentsStore =
  create<CommentsStore>((set) => ({
  commentsMap: {},

  fetchComments: async (
    postId: string,
    videoPartId?: string
  ) => {
    const token = await getAuthToken();

    const keyId = videoPartId ?? postId;

    if (!keyId) {
      console.log("[COMMENTS FETCH] Missing post/video ID");
      return [];
    }

    const column = videoPartId
      ? "video_part_id"
      : "post_id";

    const value = videoPartId ?? postId;

    console.log("[COMMENTS FETCH]", {
      keyId,
      column,
      value,
      hasToken: !!token,
    });

    try {
      const response = await api.get(
        `/api/comments?${column}=${encodeURIComponent(value)}`,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      const data = response.data;

      console.log("[COMMENTS RESPONSE]", {
        keyId,
        status: response.status,
        count: Array.isArray(data)
          ? data.length
          : 0,
      });

      set((state: CommentsStore) => ({
        commentsMap: {
          ...state.commentsMap,
          [keyId]: Array.isArray(data)
            ? data
            : [],
        },
      }));

      return Array.isArray(data)
        ? data
        : [];
    } catch (error: any) {
      console.log("[COMMENTS FETCH ERROR]", {
        keyId,
        column,
        value,
        status: error?.response?.status,
        response: error?.response?.data,
        message: error?.message,
      });

      set((state: CommentsStore) => ({
        commentsMap: {
          ...state.commentsMap,
          [keyId]: [],
        },
      }));

      return [];
    }
  },

  addComment: (
    keyId: string,
    comment: any
  ) =>
  set((state: CommentsStore) => {
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
