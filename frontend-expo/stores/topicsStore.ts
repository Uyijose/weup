import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";

export const useTopicsStore = create((set) => ({
  topics: [],
  loading: false,

  fetchTopics: async () => {
    console.log("fetchTopics called");

    set({ loading: true });

    const { data, error } = await supabase
      .from("topics")
      .select("name, total_posts")
      .order("total_posts", { ascending: false });

    if (error) {
      console.log("fetchTopics error", error);
      set({ loading: false });
      return;
    }

    console.log("topics fetched", data);

    set({
      topics: data,
      loading: false
    });
  }
}));
