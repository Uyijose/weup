import { create } from "zustand";

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notifications.service";

import type {
  Notification,
} from "../types/notification";

type NotificationsState = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (
    notificationId: string
  ) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (
    notification: Notification
  ) => void;
};

export const useNotificationsStore =
  create<NotificationsState>((set) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    loadNotifications: async () => {
      try {
        set({
          loading: true,
          error: null,
        });

        const response =
          await fetchNotifications();

        if (response.error) {
          set({
            loading: false,
            error: response.error,
          });
          return;
        }

        set({
          notifications:
            response.notifications ?? [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.log(
          "[NOTIFICATIONS STORE] LOAD ERROR",
          error
        );

        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load notifications",
        });
      }
    },

    loadUnreadCount: async () => {
      try {
        const response =
          await fetchUnreadNotificationCount();

        if (response.error) {
          set({
            error: response.error,
          });
          return;
        }

        set({
          unreadCount:
            response.unreadCount ?? 0,
          error: null,
        });
      } catch (error) {
        console.log(
          "[NOTIFICATIONS STORE] UNREAD COUNT ERROR",
          error
        );

        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load unread notification count",
        });
      }
    },

    markAsRead: async (notificationId) => {
      try {
        const response =
          await markNotificationAsRead(
            notificationId
          );

        if (response.error) {
          set({
            error: response.error,
          });
          return;
        }

        set((state) => ({
          notifications:
            state.notifications.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      read: true,
                    }
                  : notification
            ),
          unreadCount:
            state.notifications.find(
              (notification) =>
                notification.id ===
                notificationId
            )?.read
              ? state.unreadCount
              : Math.max(
                  state.unreadCount - 1,
                  0
                ),
          error: null,
        }));
      } catch (error) {
        console.log(
          "[NOTIFICATIONS STORE] MARK READ ERROR",
          error
        );

        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to mark notification as read",
        });
      }
    },

    markAllAsRead: async () => {
      try {
        const response =
          await markAllNotificationsAsRead();

        if (response.error) {
          set({
            error: response.error,
          });
          return;
        }

        set((state) => ({
          notifications:
            state.notifications.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            ),
          unreadCount: 0,
          error: null,
        }));
      } catch (error) {
        console.log(
          "[NOTIFICATIONS STORE] MARK ALL READ ERROR",
          error
        );

        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to mark notifications as read",
        });
      }
    },

    addNotification: (notification) => {
      set((state) => {
        const exists =
          state.notifications.some(
            (item) =>
              item.id === notification.id
          );

        if (exists) {
          return state;
        }

        return {
          notifications: [
            notification,
            ...state.notifications,
          ],
          unreadCount: notification.read
            ? state.unreadCount
            : state.unreadCount + 1,
        };
      });
    },
  }));