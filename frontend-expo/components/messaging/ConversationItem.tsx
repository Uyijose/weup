import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Conversation } from "../../stores/messagesStore";
import { styles } from "../../styles/messaging/messages.styles";

type ConversationItemProps = {
  conversation: Conversation;
  onPress: () => void;
};

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

  const avatarSource =
    firstMember?.username?.trim()?.charAt(0)?.toUpperCase() ||
    title.charAt(0).toUpperCase() ||
    "?";

  const lastMessage =
    typeof conversation.last_message === "string" &&
    conversation.last_message.trim()
      ? conversation.last_message.trim()
      : "No messages yet";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.conversationItem,
        pressed && styles.conversationItemPressed,
      ]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{avatarSource}</Text>
      </View>

      <View style={styles.conversationContent}>
        <Text
          style={styles.conversationTitle}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={styles.conversationMeta}
          numberOfLines={1}
        >
          {lastMessage}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#555555"
      />
    </Pressable>
  );
}