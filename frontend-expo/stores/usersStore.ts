import { create } from "zustand";
import { supabase } from "../lib/supabase";

type User = Record<string, any>;

type UsersState = {
  usersMap: Record<string, User>;
  loading: boolean;
  fetchUserById: (id: string, force?: boolean) => Promise<void>;
};

export const useUsersStore = create<UsersState>((set, get) => ({
  usersMap: {},
  loading: false,

  fetchUserById: async (id: string, force = false) => {
    if (!id) {
      return;
    }

    if (!force && get().usersMap[id]) {
      return;
    }

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.log("[USERS] Failed to fetch user:", error);

        set({ loading: false });
        return;
      }

      set((state) => ({
        usersMap: {
          ...state.usersMap,
          [id]: data as User,
        },
        loading: false,
      }));
    } catch (error: unknown) {
      console.log("[USERS] Unexpected error:", error);

      set({ loading: false });
    }
  },
}));