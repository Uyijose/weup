import React, {
  ReactNode,
  useEffect,
  useRef,
} from "react";

import { useAuthStore } from "../stores/authStore";
import { useNotificationsStore } from "../stores/notificationsStore";
import {
  subscribeToNotifications,
} from "../utils/realtimeNotifications";

interface Props {
  children: ReactNode;
}

export default function NotificationProvider({
  children,
}: Props) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  const loadNotifications =
    useNotificationsStore(
      (state) => state.loadNotifications
    );

  const loadUnreadCount =
    useNotificationsStore(
      (state) => state.loadUnreadCount
    );

  const unsubscribeRef = useRef<
    (() => void) | null
  >(null);

  useEffect(() => {
    // Do nothing while auth is still loading.
    if (loading) {
      return;
    }

    // Clean up any previous subscription.
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // User logged out.
    if (!user?.id) {
      return;
    }

    console.log(
      "[NOTIFICATION PROVIDER] Initializing for:",
      user.id
    );

    let active = true;

    const initialize = async () => {
      try {
        /*
         * Load existing notifications first.
         */
        await Promise.all([
          loadNotifications(),
          loadUnreadCount(),
        ]);

        if (!active) {
          return;
        }

        /*
         * Then subscribe to future notifications.
         */
        console.log(
          "[NOTIFICATION PROVIDER] Subscribing..."
        );

        unsubscribeRef.current =
          subscribeToNotifications(user.id);
      } catch (error) {
        console.log(
          "[NOTIFICATION PROVIDER] Initialization error:",
          error
        );
      }
    };

    initialize();

    return () => {
      active = false;

      if (unsubscribeRef.current) {
        console.log(
          "[NOTIFICATION PROVIDER] Cleaning up subscription"
        );

        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [
    user?.id,
    loading,
    loadNotifications,
    loadUnreadCount,
  ]);

  return <>{children}</>;
}