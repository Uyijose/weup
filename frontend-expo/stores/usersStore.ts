import { create } from "zustand";
import { supabase } from "../lib/supabase";

type User = Record<string, any>;

type UsersState = {
  usersMap: Record<string, User>;
  loading: boolean;
  fetchUserById: (id: string, force?: boolean) => Promise<void>;
  fetchCreatorByUsername: (
    username: string,
    force?: boolean
  ) => Promise<User | null>;
  checkSubscription: (
    subscriberId: string,
    creatorId: string
  ) => Promise<boolean>;
  getSubscriberCount: (
    creatorId: string
  ) => Promise<number>;
  toggleSubscription: (
    subscriberId: string,
    creatorId: string,
    subscribed: boolean
  ) => Promise<{
    success: boolean;
    subscribed: boolean;
    error?: string;
  }>;
};

export const useUsersStore = create<UsersState>((set, get) => ({
  usersMap: {},
  loading: false,

  fetchUserById: async (id, force = false) => {
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

  fetchCreatorByUsername: async (
    username,
    force = false
  ) => {
    if (!username) {
      return null;
    }

    const cacheKey = `creator:${username}`;

    if (!force && get().usersMap[cacheKey]) {
      return get().usersMap[cacheKey];
    }

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("creator_username", username)
        .eq("is_creator", true)
        .single();

      if (error || !data) {
        console.log(
          "[CREATOR] Failed to fetch creator:",
          error
        );

        set({ loading: false });
        return null;
      }

      set((state) => ({
        usersMap: {
          ...state.usersMap,
          [cacheKey]: data as User,
          [data.id]: data as User,
        },
        loading: false,
      }));

      return data as User;
    } catch (error: unknown) {
      console.log(
        "[CREATOR] Unexpected error:",
        error
      );

      set({ loading: false });

      return null;
    }
  },

  getSubscriberCount: async (creatorId) => {
    if (!creatorId) {
      return 0;
    }

    try {
      const { count, error } = await supabase
        .from("subscriptions")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("creator_id", creatorId);

      if (error) {
        console.log(
          "[SUBSCRIPTION] Failed to get subscriber count:",
          error
        );

        return 0;
      }

      return count ?? 0;
    } catch (error: unknown) {
      console.log(
        "[SUBSCRIPTION] Unexpected subscriber count error:",
        error
      );

      return 0;
    }
  },

  checkSubscription: async (
    subscriberId,
    creatorId
  ) => {
    if (!subscriberId || !creatorId) {
      return false;
    }

    if (subscriberId === creatorId) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("subscriber_id", subscriberId)
        .eq("creator_id", creatorId)
        .maybeSingle();

      if (error) {
        console.log(
          "[SUBSCRIPTION] Failed to check subscription:",
          error
        );

        return false;
      }

      return !!data;
    } catch (error: unknown) {
      console.log(
        "[SUBSCRIPTION] Unexpected check error:",
        error
      );

      return false;
    }
  },

  toggleSubscription: async (
    subscriberId,
    creatorId,
    subscribed
  ) => {
    if (!subscriberId || !creatorId) {
      return {
        success: false,
        subscribed,
        error: "Missing user information",
      };
    }

    if (subscriberId === creatorId) {
      return {
        success: false,
        subscribed,
        error: "You cannot subscribe to yourself",
      };
    }

    try {
      if (subscribed) {
        const { error } = await supabase
          .from("subscriptions")
          .delete()
          .eq("subscriber_id", subscriberId)
          .eq("creator_id", creatorId);

        if (error) {
          console.log(
            "[SUBSCRIPTION] Failed to unsubscribe:",
            error
          );

          return {
            success: false,
            subscribed: true,
            error: error.message,
          };
        }

        set((state) => {
          const creator = state.usersMap[creatorId];

          if (!creator) {
            return state;
          }

          return {
            usersMap: {
              ...state.usersMap,
              [creatorId]: {
                ...creator,
                subscribers_count: Math.max(
                  0,
                  Number(creator.subscribers_count ?? 0) - 1
                ),
              },
            },
          };
        });

        return {
          success: true,
          subscribed: false,
        };
      }

      const { error } = await supabase
        .from("subscriptions")
        .insert({
          subscriber_id: subscriberId,
          creator_id: creatorId,
        });

      if (error) {
        console.log(
          "[SUBSCRIPTION] Failed to subscribe:",
          error
        );

        return {
          success: false,
          subscribed: false,
          error: error.message,
        };
      }

      set((state) => {
        const creator = state.usersMap[creatorId];

        if (!creator) {
          return state;
        }

        return {
          usersMap: {
            ...state.usersMap,
            [creatorId]: {
              ...creator,
              subscribers_count:
                Number(
                  creator.subscribers_count ?? 0
                ) + 1,
            },
          },
        };
      });

      return {
        success: true,
        subscribed: true,
      };
    } catch (error: unknown) {
      console.log(
        "[SUBSCRIPTION] Unexpected toggle error:",
        error
      );

      return {
        success: false,
        subscribed,
        error:
          error instanceof Error
            ? error.message
            : "Subscription failed",
      };
    }
  },
}));