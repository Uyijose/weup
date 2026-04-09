import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";
import { getAuthToken } from "../utils/getAuthToken";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  hydrating: false,
  showAgeGate: false,

  hydrateAuth: async () => {
    if (get().hydrating) {
      console.log("[AUTH] hydrateAuth skipped (already hydrating)");
      return;
    }
    set({ loading: true, hydrating: true });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.log("[AUTH] session error, clearing auth");
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
        console.log("[AUTH] no session user");
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

  checkAgeGate: async () => {
    const { user } = get();
    if (!user) {
      const storedAdult = localStorage.getItem("is_adult");
      if (!storedAdult) {
        set({ showAgeGate: true });
        return;
      }
      set({ showAgeGate: false });
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("is_adult")
      .eq("id", user.id)
      .single();
    if (error || !data?.is_adult) {
      set({ showAgeGate: true });
      return;
    }

    set({ showAgeGate: false });
  },

  confirmAdult: async () => {
    const { user } = get();
    if (!user) {
      localStorage.setItem("is_adult", "true");
      set({ showAgeGate: false });
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ is_adult: true })
      .eq("id", user.id);
    if (!error) {
      set({ showAgeGate: false });
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
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      console.log("[AUTH] auth event:", event);

      if (event === "SIGNED_OUT") {
        console.log("[AUTH] user signed out, clearing auth");
        useAuthStore.getState().clearAuth();
      }
    });

    return listener.subscription;
  }

}));
