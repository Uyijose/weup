import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";

export const useUsersStore = create((set, get) => ({
  usersMap: {},
  loading: false,

  fetchUserById: async (id) => {
    if (get().usersMap[id]) {
      return;
    }
    set({ loading: true });

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      set({ loading: false });
      return;
    }

    set(state => ({
      usersMap: {
        ...state.usersMap,
        [id]: data
      },
      loading: false
    }));
  }
}));
