import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";

export const useWatchedHistoryStore = create((set, get) => ({
  watchedVideos: [],
  loading: false,

  fetchWatchedHistory: async (userId) => {
    if (!userId) return;
    set({ loading: true });

    const { data: views, error } = await supabase
      .from("post_views")
      .select(`
        post_id,
        video_part_id,
        viewed_at,
        posts:post_id (
          id,
          video_url,
          caption,
          topic,
          user_id,
          thumbnail_url,
          created_at
        ),
        video_parts:video_part_id (
          id,
          video_url,
          post_id,
          part_number
        )
      `)
      .eq("viewer_id", userId)
      .order("viewed_at", { ascending: false });

    if (error) {
      set({ loading: false });
      return;
    }

    const map = new Map();

    views.forEach(v => {
    let key = null;
    let video = null;

    if (v.video_parts) {
      key = "part_" + v.video_parts.id;
      video = {
        id: v.video_parts.id,
        video_url: v.video_parts.video_url,
        topic: "Part " + v.video_parts.part_number,
        user_id: v.video_parts.post_id,
        caption: v.posts?.caption || "",
        thumbnail_url: v.posts?.thumbnail_url || "",
        created_at: v.posts?.created_at || null,
        parent_post_id: v.posts?.id || null
      };
    } else if (v.posts) {
      key = "post_" + v.posts.id;

      video = {
        ...v.posts,
        caption: v.posts.caption || "",
        thumbnail_url: v.posts.thumbnail_url || "",
        created_at: v.posts.created_at || null
      };
    }

    if (!key || !video) return;

    if (!map.has(key)) {
        map.set(key, video);
    }
    });

    const resolved = Array.from(map.values());
    set({
    watchedVideos: resolved,
    loading: false
    });
  },

  addView: async ({ post, userId }) => {
    const postId = post.original_post_id ? null : post.id;
    const videoPartId = post.original_post_id ? post.id : null;
    const key = videoPartId ? "part_" + videoPartId : "post_" + post.id;

    const alreadyViewed = get().watchedVideos.some(v =>
      videoPartId ? v.id === videoPartId : v.id === post.id
    );

    if (alreadyViewed) {
      console.log("SKIP view (already watched)", key);
      return;
    }

    console.log("COUNTING view", key);

    try {
      if (!userId) {
        let anonId = document.cookie.match(/(^| )anon_id=([^;]+)/)?.[2];
        if (!anonId) {
          anonId = crypto.randomUUID();
          document.cookie = `anon_id=${anonId}; path=/; max-age=31536000`;
          console.log("Created anon_id", anonId);
        }

        try {
          const { data, error } = await supabase
            .from("post_views")
            .insert({
              post_id: post.id,
              video_part_id: videoPartId,
              anon_id: anonId
            })
            .select();

          if (error) {
            if (error.code === "23505") {
              console.log("ANON DUPLICATE view ignored", key);
              return;
            }
            if (error.code === "42501") {
              console.log("ANON VIEW BLOCKED by RLS", key, error.message);
              return;
            }
            console.log("ANON VIEW ERROR", error);
            return;
          }

          console.log("ANON VIEW SAVED", key, data);
        } catch (err) {
          console.log("ANON VIEW THROW ERROR", key, err.message || err);
          return;
        }
      } else {
        const { error } = await supabase.from("post_views").insert({
          post_id: postId,
          video_part_id: videoPartId,
          viewer_id: userId
        });

        if (error) {
          if (error.code === "23505") {
            console.log("DUPLICATE view ignored", key);
            return;
          }
          throw error;
        }

        if (!post.original_post_id) {
          await supabase.rpc("increment_post_views", {
            p_post_id: post.id.toString(),
            p_viewer_id: userId.toString(),
            p_creator_id: post.user_id.toString()
          });
        }
      }

      console.log("VIEW SAVED", key);

      set(state => ({
        watchedVideos: [...state.watchedVideos, post]
      }));
    } catch (err) {
      console.log("VIEW ERROR", err?.code || err?.message);
    }
  }

}));
