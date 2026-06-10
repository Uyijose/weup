import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";

export const usePostsStore = create((set, get) => ({
  allPosts: [],
  rawPosts: [],
  activeFeed: {
    category: "explore",
    orderedIds: []
  },
  feedInitialized: {
    explore: false,
    most_viewed: false,
    new: false,
    parts: false
  },
  feedsByCategory: {
    explore: [],
    most_viewed: [],
    new: [],
    parts: [],
    watched: [],
    creator: []
  },
  posts: [],
  postsMap: {},
  renderedIds: [],

  bufferSize: 5,
  currentIndex: 0,

  setCurrentIndex: (index) => {
    set({ currentIndex: index });
  },

  explorePage: 1,
  exploreUIState: {
    category: "explore"
  },
  setExploreUIState: (state) => {
    set({ exploreUIState: state });
  },
  EXPLORE_PAGE_SIZE: 12,

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
    const feedItems = [];

    posts.forEach((post) => {
      const parts = Array.isArray(post.video_parts) ? post.video_parts : [];

      const enrichedPost = {
        ...post,
        partsCount: parts.length
      };

      map[post.id] = enrichedPost;
      if (parts.length > 0) {
        const sortedParts = [...parts].sort(
          (a, b) => a.part_number - b.part_number
        );

        sortedParts.forEach((part) => {
          const compositeId = `${post.id}-part-${part.part_number}`;

          const partItem = {
            type: "part",
            id: compositeId,
            video_part_id: part.id,
            post_id: post.id,
            part_number: part.part_number,
            video_url: part.video_url,
            caption: post.caption,
            topic: post.topic,
            user_id: part.user_id ?? post.user_id,
            likes_count: part.likes_count ?? 0,
            comments_count: part.comments_count ?? 0,
            views_count: part.views_count ?? post.views_count ?? 0,
            created_at: part.created_at ?? post.created_at,
            original_post: enrichedPost
          };
          
          feedItems.push(partItem);

          map[compositeId] = partItem;
        });
      } else {
        feedItems.push({
          type: "post",
          id: post.id,
          ...enrichedPost
        });
      }
    });

    set({
      allPosts: feedItems,
      postsMap: map,
      posts: [],
      currentIndex: 0
    });

    console.log("[HYDRATE ALL POSTS]", {
      raw: get().rawPosts?.length,
      hydrated: feedItems.length
    });
  },

  setActiveFeed: (posts, category = "explore") => {
    const map = {};
    let ordered = [...posts];

    console.log("[SET ACTIVE FEED RAW]", {
      category,
      inputCount: posts?.length || 0
    });

    if (category === "new") {
      ordered.sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return bTime - aTime;
      });
    }

    if (category === "most_viewed") {
      ordered.sort((a, b) => {
        return (b.views_count || 0) - (a.views_count || 0);
      });
    }

    if (category === "explore") {
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
    }

    const orderedIds = [];

    ordered.forEach(p => {
      map[p.id] = p;
      orderedIds.push(p.id);
    });

    set(state => ({
      postsMap: {
        ...state.postsMap,
        ...map
      },
      activeFeed: {
        category,
        orderedIds
      },
      feedsByCategory: {
        ...state.feedsByCategory,
        [category]: orderedIds
      }
    }));

    console.log("[ACTIVE FEED UPDATED]", {
      category,
      orderedCount: orderedIds.length,
      sampleFirst: orderedIds[0]
    });
  },

  hydrateWatchedFeed: (videos) => {
    console.log("[WATCHED FEED] hydrate", videos.length);

    const map = {};
    const orderedIds = [];

    videos.forEach(v => {
      let id;

      if (v.parent_post_id) {
        id = `${v.parent_post_id}-part-${v.topic?.replace("Part ", "")}`;
      } else {
        id = v.id;
      }

      map[id] = {
        ...v,
        id,
        type: v.parent_post_id ? "part" : "post",
        post_id: v.parent_post_id || v.id
      };

      orderedIds.push(id);
    });

    set(state => ({
      postsMap: { ...state.postsMap, ...map },
      feedsByCategory: {
        ...state.feedsByCategory,
        watched: orderedIds
      }
    }));
  },

  hydrateCreatorFeed: (_, creatorId) => {
    const rawPosts = get().rawPosts;

    console.log("[CREATOR FEED RAW SOURCE]", {
      rawPostsCount: rawPosts.length,
      creatorId
    });

    const creatorPosts = rawPosts.filter(p => String(p.user_id) === String(creatorId));

    const expandedFeed = [];

    const map = {};

    creatorPosts.forEach(post => {
      const parts = Array.isArray(post.video_parts) ? post.video_parts : [];

      console.log("[CREATOR POST CHECK]", {
        postId: post.id,
        hasParts: parts.length
      });

      if (parts.length > 0) {
        const sortedParts = [...parts].sort((a, b) => a.part_number - b.part_number);

        sortedParts.forEach(part => {
          const compositeId = `${post.id}-part-${part.part_number}`;

          const partItem = {
            type: "part",
            id: compositeId,
            video_part_id: part.id,
            post_id: post.id,
            part_number: part.part_number,
            video_url: part.video_url,
            caption: post.caption,
            topic: post.topic,
            user_id: part.user_id ?? post.user_id,
            likes_count: part.likes_count ?? 0,
            comments_count: part.comments_count ?? 0,
            views_count: part.views_count ?? post.views_count ?? 0,
            created_at: part.created_at ?? post.created_at,
            original_post: post
          };

          expandedFeed.push(partItem);
          map[compositeId] = partItem;

          console.log("[CREATOR PART ADDED]", compositeId);
        });

      } else {
        expandedFeed.push(post);
        map[post.id] = post;

        console.log("[CREATOR POST ADDED]", post.id);
      }
    });

    const orderedIds = expandedFeed.map(p => p.id);

    set(state => ({
      postsMap: {
        ...state.postsMap,
        ...map
      },
      feedsByCategory: {
        ...state.feedsByCategory,
        creator: orderedIds
      },
      activeFeed: {
        category: "creator",
        orderedIds
      }
    }));

    console.log("[CREATOR FEED DONE EXPANDED]", {
      total: expandedFeed.length,
      orderedIds
    });
  },

  fetchAllPosts: async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        users (
          creator_username
        ),
        video_parts (
          id,
          post_id,
          part_number,
          video_url,
          likes_count,
          comments_count,
          views_count,
          created_at,
          user_id
        )
      `);

    if (error) {
      return [];
    }

    const normalized = data.map(post => ({
      ...post,
      users: post.users || null,
      video_parts: post.video_parts || []
    }));

    const map = {};
    normalized.forEach(post => {
      map[post.id] = post;
    });
    set({
      rawPosts: normalized,
      allPosts: normalized,
      postsMap: map
    });

    console.log("[FETCH ALL POSTS]", {
      total: normalized.length
    });

    return normalized;
  },

  loadInitialFeedPosts: () => {
    const { activeFeed, postsMap, bufferSize } = get();

    const firstBatch = activeFeed.orderedIds
      .slice(0, bufferSize)
      .map(id => postsMap[id])
      .filter(Boolean);
    set({
      posts: firstBatch,
      currentIndex: firstBatch.length
    });
  },

  appendNextPost: () => {
    const { activeFeed, posts, postsMap, currentIndex, renderedIds } = get();

    let idx = currentIndex;

    while (
      idx < activeFeed.orderedIds.length &&
      renderedIds.includes(activeFeed.orderedIds[idx])
    ) {
      idx++;
    }

    if (idx >= activeFeed.orderedIds.length) return;

    const nextId = activeFeed.orderedIds[idx];
    const nextPost = postsMap[nextId];

    if (!nextPost) return;
    set({
      posts: [...posts, nextPost],
      currentIndex: idx + 1,
      renderedIds: [...renderedIds, nextId]
    });
  },

  forceFirstPost: (post) => {
    set({
      posts: [post],
      currentIndex: 0,
      renderedIds: [post.id]
    });
  },

  updateLikesCount: (id, likes_count) => {
    set(state => {
      const updatedMap = { ...state.postsMap };

      if (updatedMap[id]) {
        updatedMap[id].likes_count = likes_count;
      } else {
        console.log("[LIKE UPDATE MAP MISS]", { id });
      }

      return {
        postsMap: updatedMap
      };
    });
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
