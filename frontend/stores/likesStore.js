import { create } from "zustand";
import { getAuthToken } from "../utils/getAuthToken.js";

export const useLikesStore = create((set, get) => ({
  likesMap: {},

  fetchLikeState: async (postId, isVideoPart) => {
    const token = await getAuthToken();
    if (!token) return;

    const column = isVideoPart ? "video_part_id" : "post_id";

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/likes/state?${column}=${postId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    set(state => ({
      likesMap: {
        ...state.likesMap,
        [postId]: {
          hasLiked: data.hasLiked,
          likeId: data.likeId,
        }
      }
    }));
  },

  toggleLike: async (postId, isVideoPart) => {
    const token = await getAuthToken();
    if (!token) return null;

    const current = get().likesMap[postId];
    const hasLiked = current?.hasLiked;
    const postsStore = require("./postsStore.js").usePostsStore.getState();
    const currentPost = postsStore.postsMap[postId];
    const currentCount = currentPost?.likes_count ?? 0;

    const newCount = hasLiked ? currentCount - 1 : currentCount + 1;
    postsStore.updateLikesCount(postId, newCount);

    set(state => ({
      likesMap: {
        ...state.likesMap,
        [postId]: {
          ...state.likesMap[postId],
          hasLiked: !hasLiked,
        }
      }
    }));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/likes/toggle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: isVideoPart ? null : postId,
          video_part_id: isVideoPart ? postId : null,
        }),
      }
    );

    const data = await res.json();
    await get().fetchLikeState(postId, isVideoPart);

    return data;
  }
}));
