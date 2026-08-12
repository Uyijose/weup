import { supabase } from "../lib/supabase";
import { useNotificationsStore } from "../stores/notificationsStore";
import type { Notification } from "../types/notification";

export function subscribeToNotifications(
  userId: string
): () => void {
  if (!userId) {
    console.log(
      "[REALTIME NOTIFICATIONS] No user ID provided"
    );

    return () => {};
  }

  console.log(
    "[REALTIME NOTIFICATIONS] Subscribing for user:",
    userId
  );

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        console.log(
          "[REALTIME NOTIFICATIONS] New notification:",
          payload.new
        );

        const notification =
          payload.new as Notification;

        useNotificationsStore
          .getState()
          .addNotification(notification);
      }
    )
    .subscribe((status) => {
      console.log(
        "[REALTIME NOTIFICATIONS] Status:",
        status
      );
    });

  return () => {
    console.log(
      "[REALTIME NOTIFICATIONS] Unsubscribing:",
      userId
    );

    supabase.removeChannel(channel);
  };
}