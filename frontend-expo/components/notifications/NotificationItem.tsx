import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";

import type { Notification } from "../../types/notification";
import { useNotificationsStore } from "../../stores/notificationsStore";
import { styles } from "../../styles/notifications/notifications.styles";

type Props = {
  notification: Notification;
  onPress: () => void;
};

function getIcon(type: string) {
  switch (type) {
    case "like":
      return "heart";

    case "comment":
      return "chatbubble";

    case "follow":
      return "person-add";

    case "message":
      return "chatbubble-ellipses";

    case "system":
      return "information-circle";

    default:
      return "notifications";
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff =
    Math.max(
      0,
      now.getTime() - date.getTime()
    ) / 1000;

  if (diff < 60) {
    return "Just now";
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }

  if (diff < 604800) {
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return date.toLocaleDateString();
}

export default function NotificationItem({
  notification,
  onPress,
}: Props) {
  const markAsRead =
    useNotificationsStore(
      (state) => state.markAsRead
    );

  const handlePress = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.notification,
        !notification.read &&
          styles.notificationUnread,
      ]}
    >
      <View style={styles.avatar}>
        <Ionicons
          name={getIcon(notification.type) as any}
          size={22}
          color="#EDEDED"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {notification.title}
        </Text>

        <Text style={styles.body}>
          {notification.body}
        </Text>

        <Text style={styles.timestamp}>
          {formatTime(
            notification.created_at
          )}
        </Text>
      </View>

      {!notification.read && (
        <View style={styles.unreadDot} />
      )}
    </Pressable>
  );
}