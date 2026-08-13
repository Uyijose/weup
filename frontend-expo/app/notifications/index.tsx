import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import NotificationItem from "../../components/notifications/NotificationItem";
import { useNotificationsStore } from "../../stores/notificationsStore";
import { styles } from "../../styles/notifications/notifications.styles";
import { subscribeToNotifications } from "../../utils/realtimeNotifications";
import { useAuthStore } from "../../stores/authStore";

export default function NotificationsScreen() {
  const {
    notifications,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
  } = useNotificationsStore();

  const user = useAuthStore((state) => state.user);

  const loadData = useCallback(async () => {
    await Promise.all([
      loadNotifications(),
      loadUnreadCount(),
    ]);
  }, [
    loadNotifications,
    loadUnreadCount,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // useEffect(() => {
  //   if (!user?.id) {
  //     return;
  //   }

  //   const unsubscribe =
  //     subscribeToNotifications(user.id);

  //   return unsubscribe;
  // }, [user?.id]);

  const handleNotificationPress = (
    notification: {
      id: string;
      type: string;
      reference_id?: string | null;
      reference_type?: string | null;
      actor_id?: string | null;
    }
  ) => {
    if (
      notification.type === "like" ||
      notification.type === "comment"
    ) {
      if (notification.reference_id) {
        router.push(
          `/posts/${notification.reference_id}`
        );
      }

      return;
    }

    if (notification.type === "follow") {
      if (notification.actor_id) {
        router.push(
          `/user/${notification.actor_id}`
        );
      }

      return;
    }

    if (notification.type === "message") {
      if (notification.reference_id) {
        router.push(
          `/chat/${notification.reference_id}`
        );
      }

      return;
    }

    console.log(
      "[NOTIFICATIONS] No navigation target:",
      notification
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" />

        <Text style={styles.stateText}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View style={styles.centerState}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#EDEDED"
        />

        <Text style={styles.stateTitle}>
          Unable to load notifications
        </Text>

        <Text style={styles.stateText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadData}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#EDEDED"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Notifications
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() =>
              handleNotificationPress(item)
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
          />
        }
        contentContainerStyle={
          notifications.length === 0
            ? styles.emptyList
            : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#777777"
            />

            <Text style={styles.emptyTitle}>
              No notifications yet
            </Text>

            <Text style={styles.emptyText}>
              You'll see likes, comments, follows,
              and messages here.
            </Text>
          </View>
        }
      />
    </View>
  );
}