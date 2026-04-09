import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";

export const usePostsStore = create((set, get) => ({
  allPosts: [],
  posts: [],
  postsMap: {},

  bufferSize: 5,
  currentIndex: 0,

  explorePage: 1,
  EXPLORE_PAGE_SIZE: 11,

  getExplorePagePosts: () => {
    const { allPosts, explorePage, EXPLORE_PAGE_SIZE } = get();

    if (!allPosts.length) {
      return [];
    }

    const totalPages = Math.ceil(allPosts.length / EXPLORE_PAGE_SIZE);
    const safePage = ((explorePage - 1) % totalPages) + 1;

    const start = (safePage - 1) * EXPLORE_PAGE_SIZE;
    const end = start + EXPLORE_PAGE_SIZE;
    return allPosts.slice(start, end);
  },

  setExplorePage: (page) => {
    set({ explorePage: page });
  },

  getExploreTotalPages: () => {
    const { allPosts, EXPLORE_PAGE_SIZE } = get();
    return Math.ceil(allPosts.length / EXPLORE_PAGE_SIZE);
  },

  resetExplorePage: () => {
    set({ explorePage: 1 });
  },

  hydrateAllPosts: (posts) => {
    const map = {};

    posts.forEach(p => {
      map[p.id] = p;
    });

    set({
      allPosts: posts,
      postsMap: map,
      posts: [],
      currentIndex: 0
    });
  },

  fetchAllPosts: async () => {
    const existingPosts = get().allPosts;

    if (existingPosts.length) {
      return existingPosts;
    }
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        users (
          creator_username
        )
      `);

    if (error) {
      return [];
    }
    const map = {};

    data.forEach(post => {
      map[post.id] = post;
    });

    set({
      allPosts: data || [],
      postsMap: map
    });

    return data || [];
  },

  loadInitialPosts: () => {
    const { allPosts, bufferSize } = get();
    set({
      posts: allPosts.slice(0, bufferSize)
    });
  },

  appendNextPost: () => {
    const { allPosts, posts } = get();

    const nextIndex = posts.length;

    if (nextIndex >= allPosts.length) {
      return;
    }
    const nextPost = allPosts[nextIndex];

    set({
      posts: [...posts, nextPost],
      currentIndex: nextIndex
    });
  },

  forceFirstPost: (post) => {
    set({
      posts: [post],
      currentIndex: 0,
    });
  },

  updateLikesCount: (id, likes_count) => {
    set(state => ({
      postsMap: {
        ...state.postsMap,
        [id]: {
          ...state.postsMap[id],
          likes_count
        }
      }
    }));
  },

  updateCommentsCount: (id, comments_count) => {
    set(state => ({
      postsMap: {
        ...state.postsMap,
        [id]: {
          ...state.postsMap[id],
          comments_count
        }
      }
    }));
  }
}));