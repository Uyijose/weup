import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

import type { Conversation } from "../../stores/messagesStore";
import { styles } from "../../styles/messaging/conversationItem.styles";

type ConversationItemProps = {
  conversation: Conversation;
  onPress: () => void;
};

function formatConversationTime(
  value?: string | null
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const difference =
    now.getTime() - date.getTime();

  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  if (difference >= 0 && difference < oneWeek) {
    return date.toLocaleDateString([], {
      weekday: "short",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default function ConversationItem({
  conversation,
  onPress,
}: ConversationItemProps) {
  const title =
    typeof conversation.title === "string" &&
    conversation.title.trim()
      ? conversation.title.trim()
      : "Chat";

  const firstMember = conversation.members?.[0];

  const avatarUrl =
    firstMember?.avatar_url ?? null;

  const avatarLetter =
    firstMember?.username?.trim()?.charAt(0)?.toUpperCase() ||
    title.charAt(0).toUpperCase() ||
    "?";

  const lastMessage =
    typeof conversation.last_message === "string" &&
    conversation.last_message.trim()
      ? conversation.last_message.trim()
      : "No messages yet";

  const timestamp = formatConversationTime(
    conversation.last_message_at ??
      conversation.updated_at ??
      conversation.created_at
  );

  /*
   * We intentionally do not invent unread behaviour here.
   * If the backend later provides something such as:
   *
   * unread_count
   *
   * it can be handled here without adding API logic.
   */
  const unreadCount =
    typeof conversation.unread_count === "number"
      ? conversation.unread_count
      : 0;

  const isUnread = unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open conversation ${title}`}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {avatarLetter}
            </Text>
          </View>
        )}

        {isUnread && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              isUnread && styles.titleUnread,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {timestamp && (
            <Text
              style={[
                styles.timestamp,
                isUnread && styles.timestampUnread,
              ]}
              numberOfLines={1}
            >
              {timestamp}
            </Text>
          )}
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              isUnread && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>

          {isUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color="#555555"
      />
    </Pressable>
  );
}