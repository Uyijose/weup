// frontend-expo/stores/postsStore.ts

import { create } from "zustand";

import { ViewerPost } from "../types/post";
import {
  getPostByCompositeId,
} from "../services/posts.service";

interface PostsState {
  /**
   * Currently opened post inside the viewer.
   */
  currentPost: ViewerPost | null;

  /**
   * Loading state.
   */
  loading: boolean;

  /**
   * Last loading error.
   */
  error: string |null;

  /**
   * Loads a post or a video part.
   *
   * Supports:
   *
   * post uuid
   *
   * or
   *
   * uuid-part-2
   */
  loadPost: (
    id: string
  ) => Promise<ViewerPost | null>;

  /**
   * Replace current post.
   */
  setCurrentPost: (
    post: ViewerPost | null
  ) => void;

  /**
   * Clears viewer.
   */
  clearPost: () => void;

  /**
   * Reload current viewer item.
   */
  reloadCurrentPost: () => Promise<void>;

  /**
   * Update likes locally.
   */
  updateLikes: (
    likes: number
  ) => void;

  /**
   * Update comments locally.
   */
  updateComments: (
    comments: number
  ) => void;

  /**
   * Update views locally.
   */
  updateViews: (
    views: number
  ) => void;
}

export const usePostsStore =
create<PostsState>((set, get) => ({
  currentPost: null,

  loading: false,

  error: null,

  setCurrentPost: (
    post
  ) => {
    set({
      currentPost: post,
    });
  },

  clearPost: () => {
    set({
      currentPost: null,
      loading: false,
      error: null,
    });
  },

  loadPost: async (
    id: string
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      console.log(
        "[POST STORE] loading",
        id
      );

      const post =
        await getPostByCompositeId(id);

      if (!post) {
        set({
          currentPost: null,
          loading: false,
          error: "Post not found",
        });

        return null;
      }

      set({
        currentPost: post,
        loading: false,
        error: null,
      });

      console.log(
        "[POST STORE] loaded",
        post.id
      );

      return post;
    } catch (error) {
      console.error(
        "[POST STORE]",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load post";

      set({
        currentPost: null,
        loading: false,
        error: message,
      });

      return null;
    }
  },

  reloadCurrentPost: async () => {
    const current =
      get().currentPost;

    if (!current) {
      return;
    }

    await get().loadPost(
      current.id
    );
  },

  updateLikes: (
    likes
  ) => {
    const current =
      get().currentPost;

    if (!current) {
      return;
    }

    set({
      currentPost: {
        ...current,
        likes_count: likes,
      },
    });
  },

  updateComments: (
    comments
  ) => {
    const current =
      get().currentPost;

    if (!current) {
      return;
    }

    set({
      currentPost: {
        ...current,
        comments_count: comments,
      },
    });
  },

  updateViews: (
    views
  ) => {
    const current =
      get().currentPost;

    if (!current) {
      return;
    }

    set({
      currentPost: {
        ...current,
        views_count: views,
      },
    });
  },
}));