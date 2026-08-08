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

    const column = videoPartId ? "video_part_id" : "post_id";
    const value = videoPartId ?? postId;

    console.log("[COMMENTS FETCH]", {
      keyId,
      column,
      value
    });

    const { data } = await api.get(
    `/api/comments?${column}=${value}`,
    {
      headers: {
        Authorization: token
          ? `Bearer ${token}`
          : "",
      },
    }
  );

  console.log("[COMMENTS RESPONSE]", {
    keyId,
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
