import { create } from "zustand";

import { supabase } from "../lib/supabase";

type Category =
  | "explore"
  | "most_viewed"
  | "new";

type ExploreState = {
  category: Category;

  posts: any[];

  loading: boolean;

  setCategory: (
    category: Category
  ) => void;

  fetchPosts: () => Promise<void>;
};

export const useExploreStore =
  create<ExploreState>((set, get) => ({
    category: "explore",

    posts: [],

    loading: false,

    setCategory: (category) =>
      set({
        category,
      }),

    fetchPosts: async () => {
      console.log(
        "[EXPLORE] fetching..."
      );

      set({
        loading: true,
      });

      const { data, error } =
        await supabase
          .from("posts")
          .select(`
            *,
            users(
              creator_username
            ),
            video_parts(*)
          `);

      if (error) {
        console.log(
          "[EXPLORE ERROR]",
          error
        );

        set({
          loading: false,
        });

        return;
      }

      console.log(
        "[EXPLORE POSTS]",
        data.length
      );

      let posts = [...data];

      if (
        get().category ===
        "most_viewed"
      ) {
        posts.sort(
          (a, b) =>
            (b.views_count ?? 0) -
            (a.views_count ?? 0)
        );
      }

      if (
        get().category === "new"
      ) {
        posts.sort(
          (a, b) =>
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
        );
      }

      if (
        get().category ===
        "explore"
      ) {
        posts.sort(
          () => Math.random() - 0.5
        );
      }

      console.log(
        "[EXPLORE READY]",
        posts.length
      );

      set({
        posts,
        loading: false,
      });
    },
  }));