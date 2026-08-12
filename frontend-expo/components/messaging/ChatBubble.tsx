import React from "react";
import { Text, View } from "react-native";

import type { Message } from "../../stores/messagesStore";
import { styles } from "../../styles/messaging/chatBubble.styles";

type ChatBubbleProps = {
  message: Message;
  isMe: boolean;
};

function formatMessageTime(
  value?: string
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatBubble({
  message,
  isMe,
}: ChatBubbleProps) {
  const content =
    typeof message.content === "string"
      ? message.content
      : "";

  const timestamp = formatMessageTime(
    message.created_at
  );

  return (
    <View
      style={[
        styles.row,
        isMe ? styles.rowMe : styles.rowOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe
            ? styles.bubbleMe
            : styles.bubbleOther,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMe
              ? styles.messageTextMe
              : styles.messageTextOther,
          ]}
        >
          {content}
        </Text>

        {timestamp && (
          <Text
            style={[
              styles.timestamp,
              isMe
                ? styles.timestampMe
                : styles.timestampOther,
            ]}
          >
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}