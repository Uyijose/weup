import { create } from "zustand";
import { api } from "../lib/api";
import { getAuthToken } from "../utils/getAuthToken";
import { usePostsStore } from "./postsStore";

type LikeState = {
  hasLiked: boolean;
  likeId: string | null;
};

type LikesStore = {
  likesMap: Record<string, LikeState>;

  fetchLikeState: (
    id: string,
    isVideoPart: boolean
  ) => Promise<void>;

  toggleLike: (
    id: string,
    isVideoPart: boolean
  ) => Promise<any>;
};

export const useLikesStore =
  create<LikesStore>((set, get) => ({
    likesMap: {},

    fetchLikeState: async (
      id: string,
      isVideoPart: boolean
    ) => {
      const token = await getAuthToken();

      if (!token) {
        return;
      }

      const column = isVideoPart
        ? "video_part_id"
        : "post_id";

      const { data } = await api.get(
        `/api/likes/state?${column}=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      set((state) => ({
        likesMap: {
          ...state.likesMap,
          [id]: {
            hasLiked: data.hasLiked,
            likeId: data.likeId,
          },
        },
      }));
    },

    toggleLike: async (
      id: string,
      isVideoPart: boolean
    ) => {
      const token = await getAuthToken();

      if (!token) {
        return null;
      }

      const current =
        get().likesMap[id];

      const hasLiked =
        current?.hasLiked ?? false;

      const postsStore =
        usePostsStore.getState();

      const currentPost =
        postsStore.currentPost;

      const currentCount =
        currentPost?.likes_count ?? 0;

      const newCount = hasLiked
        ? Math.max(0, currentCount - 1)
        : currentCount + 1;

      postsStore.updateLikes(
        newCount
      );

      set((state) => ({
        likesMap: {
          ...state.likesMap,
          [id]: {
            ...state.likesMap[id],
            hasLiked: !hasLiked,
          },
        },
      }));

      const { data } = await api.post(
        "/api/likes/toggle",
        {
          post_id: isVideoPart
            ? null
            : id,
          video_part_id: isVideoPart
            ? id
            : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await get().fetchLikeState(
        id,
        isVideoPart
      );

      return data;
    },
  }));