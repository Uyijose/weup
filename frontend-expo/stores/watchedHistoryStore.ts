import { create } from "zustand";
import { supabase } from "../lib/supabase";

export type WatchedVideo = {
  id: string;
  video_url?: string | null;
  caption?: string | null;
  topic?: string | null;
  user_id?: string | null;
  thumbnail_url?: string | null;
  created_at?: string | null;
  parent_post_id?: string | null;
  post_id?: string | null;
  video_part_id?: string | null;
  part_number?: number | null;
  part?: number | null;
};

type WatchedPost = {
  id: string;
  original_post_id?: string | null;
  video_url?: string | null;
  caption?: string | null;
  topic?: string | null;
  user_id?: string | null;
  thumbnail_url?: string | null;
  created_at?: string | null;
  post_id?: string | null;
  video_part_id?: string | null;
  part_number?: number | null;
  part?: number | null;
};

type WatchedHistoryState = {
  watchedVideos: WatchedVideo[];
  loading: boolean;
  fetchWatchedHistory: (userId: string) => Promise<void>;
  addView: (params: {
    post: WatchedPost;
    userId: string | null;
  }) => Promise<void>;
};

type PostView = {
  post_id: string | null;
  video_part_id: string | null;
  viewed_at: string;
  posts:
    | {
        id: string;
        video_url?: string | null;
        caption?: string | null;
        topic?: string | null;
        user_id?: string | null;
        thumbnail_url?: string | null;
        created_at?: string | null;
      }
    | null;
  video_parts:
    | {
        id: string;
        video_url?: string | null;
        post_id?: string | null;
        part_number?: number | null;
      }
    | null;
};

export const useWatchedHistoryStore = create<WatchedHistoryState>(
  (set, get) => ({
    watchedVideos: [],
    loading: false,

    fetchWatchedHistory: async (userId: string) => {
      if (!userId) {
        return;
      }

      set({ loading: true });

      try {
        const { data, error } = await supabase
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
          console.log("[WATCHED] Failed to fetch history:", error);
          set({ loading: false });
          return;
        }

        const views = (data ?? []) as unknown as PostView[];

        const map = new Map<string, WatchedVideo>();

        views.forEach((view: PostView) => {
          let key: string | null = null;
          let video: WatchedVideo | null = null;

          if (view.video_parts) {
            key = `part_${view.video_parts.id}`;

            video = {
              id: view.video_parts.id,
              video_url: view.video_parts.video_url ?? null,
              topic:
                view.video_parts.part_number != null
                  ? `Part ${view.video_parts.part_number}`
                  : null,
              user_id: view.posts?.user_id ?? null,
              caption: view.posts?.caption ?? "",
              thumbnail_url: view.posts?.thumbnail_url ?? null,
              created_at: view.posts?.created_at ?? null,
              parent_post_id: view.posts?.id ?? null,
              post_id: view.video_parts.post_id ?? null,
              video_part_id: view.video_parts.id,
              part_number: view.video_parts.part_number ?? null,
              part: view.video_parts.part_number ?? null,
            };
          } else if (view.posts) {
            key = `post_${view.posts.id}`;

            video = {
              id: view.posts.id,
              video_url: view.posts.video_url ?? null,
              caption: view.posts.caption ?? "",
              topic: view.posts.topic ?? null,
              user_id: view.posts.user_id ?? null,
              thumbnail_url: view.posts.thumbnail_url ?? null,
              created_at: view.posts.created_at ?? null,
              post_id: view.posts.id,
            };
          }

          if (!key || !video) {
            return;
          }

          if (!map.has(key)) {
            map.set(key, video);
          }
        });

        set({
          watchedVideos: Array.from(map.values()),
          loading: false,
        });
      } catch (error: unknown) {
        console.log("[WATCHED] Unexpected error:", error);
        set({
          loading: false,
        });
      }
    },

    addView: async ({
      post,
      userId,
    }: {
      post: WatchedPost;
      userId: string | null;
    }) => {
      if (!post?.id) {
        return;
      }

      if (!userId) {
        return;
      }

      const postId = post.original_post_id ? null : post.id;
      const videoPartId = post.original_post_id ? post.id : null;

      const key = videoPartId
        ? `part_${videoPartId}`
        : `post_${post.id}`;

      const alreadyViewed = get().watchedVideos.some((video) =>
        videoPartId
          ? video.id === videoPartId
          : video.id === post.id
      );

      if (alreadyViewed) {
        console.log("[WATCHED] Skipping existing view:", key);
        return;
      }

      try {
        const { error } = await supabase
          .from("post_views")
          .insert({
            post_id: postId,
            video_part_id: videoPartId,
            viewer_id: userId,
          });

        if (error) {
          if (error.code === "23505") {
            console.log("[WATCHED] Duplicate view ignored:", key);
            return;
          }

          console.log(
            "[WATCHED] Failed to save view:",
            error.code,
            error.message
          );

          return;
        }

        if (!post.original_post_id) {
          const { error: rpcError } = await supabase.rpc(
            "increment_post_views",
            {
              p_post_id: post.id.toString(),
              p_viewer_id: userId.toString(),
              p_creator_id: post.user_id?.toString() ?? "",
            }
          );

          if (rpcError) {
            console.log(
              "[WATCHED] Failed to increment post views:",
              rpcError.code,
              rpcError.message
            );
          }
        }

        const watchedVideo: WatchedVideo = {
          id: post.id,
          video_url: post.video_url ?? null,
          caption: post.caption ?? "",
          topic: post.topic ?? null,
          user_id: post.user_id ?? null,
          thumbnail_url: post.thumbnail_url ?? null,
          created_at: post.created_at ?? null,
          post_id: post.post_id ?? post.id,
          video_part_id: post.video_part_id ?? null,
          part_number: post.part_number ?? null,
          part: post.part ?? null,
          parent_post_id: post.original_post_id ?? null,
        };

        set((state) => ({
          watchedVideos: [
            ...state.watchedVideos,
            watchedVideo,
          ],
        }));

        console.log("[WATCHED] View saved:", key);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(
            "[WATCHED] View error:",
            error.message
          );
        } else {
          console.log("[WATCHED] View error:", error);
        }
      }
    },
  })
);