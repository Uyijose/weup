import { create } from "zustand";
import { supabase } from "../lib/supabase";
import getAuthToken from "../utils/getAuthToken";
import { AuthState } from "../types/auth";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,
  hydrating: false,

  hydrateAuth: async () => {
    if (get().hydrating) return;

    set({
      loading: true,
      hydrating: true,
    });

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        set({
          user: null,
          token: null,
          loading: false,
          hydrating: false,
        });

        return;
      }

      const sessionUser = session?.user ?? null;

      let token: string | null = null;

      if (sessionUser) {
        try {
          token = await Promise.race<string | null>([
            getAuthToken(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("TOKEN_TIMEOUT")), 5000)
            ),
          ]);
        } catch (error) {
          console.log("[AUTH] Token timeout");
        }
      }

      if (!sessionUser) {
        set({
          user: null,
          token,
          loading: false,
          hydrating: false,
        });

        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      set({
        user: profile ?? {
          id: sessionUser.id,
          email: sessionUser.email ?? "",
        },
        token,
        loading: false,
        hydrating: false,
      });
    } catch (error) {
      console.log("[AUTH]", error);

      set({
        user: null,
        token: null,
        loading: false,
        hydrating: false,
      });
    }
  },

  clearAuth: () => {
    set({
      user: null,
      token: null,
      loading: false,
      hydrating: false,
    });
  },

  logout: async () => {
    await supabase.auth.signOut();

    set({
      user: null,
      token: null,
      loading: false,
      hydrating: false,
    });
  },

  listenToAuthChanges: () => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      console.log("[AUTH EVENT]", event);

      if (event === "SIGNED_OUT") {
        useAuthStore.getState().clearAuth();
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        setTimeout(() => {
          useAuthStore.getState().hydrateAuth();
        }, 0);
      }
    });

    return data.subscription;
  },
}));