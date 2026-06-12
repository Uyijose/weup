import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";
import { getAuthToken } from "../utils/getAuthToken";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  hydrating: false,

  hydrateAuth: async () => {
    if (get().hydrating) {
      return;
    }
    set({ loading: true, hydrating: true });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        set({ user: null, token: null, loading: false, hydrating: false });
        return;
      }

      const sessionUser = sessionData.session?.user ?? null;

      let token = null;

      if (sessionUser) {
        try {
          token = await Promise.race([
            getAuthToken(),
            new Promise((_, reject) =>
              setTimeout(() => reject("TOKEN_TIMEOUT"), 5000)
            )
          ]);
        } catch (e) {
        }
      } else {
      }

      if (!sessionUser) {
        set({ user: null, token, loading: false, hydrating: false });
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .single();
      set({
        user: userData || sessionUser,
        token,
        loading: false,
        hydrating: false
      });
    } catch (err) {
      set({ user: null, token: null, loading: false, hydrating: false });
    }
  },

  clearAuth: () => {
    set({
      user: null,
      token: null,
      loading: false
    });
  },

  logout: async () => {
    await supabase.auth.signOut();

    set({
      user: null,
      token: null,
      loading: false
    });
  },

  listenToAuthChanges: () => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {

      console.log("[AUTH EVENT]", event);

      if (event === "SIGNED_OUT") {
        console.log("[AUTH] signed out → clearing store");
        useAuthStore.getState().clearAuth();
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        console.log("[AUTH] signed in or refreshed → hydrating auth");

        setTimeout(() => {
          useAuthStore.getState().hydrateAuth();
        }, 0);
      }
    });

    return listener.subscription;
  }

}));
