import { create } from "zustand";

import { supabase } from "../lib/supabase";

export type Topic = {
  name: string;
  total_posts: number;
};

type TopicsStore = {
  topics: Topic[];
  loading: boolean;
  fetchTopics: () => Promise<void>;
};

export const useTopicsStore =
  create<TopicsStore>((set) => ({
    topics: [],
    loading: false,

    fetchTopics: async () => {
      console.log(
        "[TOPICS STORE] fetchTopics called"
      );

      set({
        loading: true,
      });

      const { data, error } =
        await supabase
          .from("topics")
          .select(
            "name, total_posts"
          )
          .order(
            "total_posts",
            {
              ascending: false,
            }
          );

      if (error) {
        console.log(
          "[TOPICS STORE] fetchTopics error:",
          error
        );

        set({
          loading: false,
        });

        return;
      }

      console.log(
        "[TOPICS STORE] topics fetched:",
        data
      );

      set({
        topics: data ?? [],
        loading: false,
      });
    },
  }));