import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { emitTyping } from "../../utils/realtimeChat";
import { useMessagesStore } from "../../stores/messagesStore";
import { styles } from "../../styles/messaging/chat.styles";

type ChatInputProps = {
  conversationId: string;
  userId: string;
  bottomInset: number;
  onError: (message: string) => void;
  onSent: () => void;
};

export default function ChatInput({
  conversationId,
  userId,
  bottomInset,
  onError,
  onSent,
}: ChatInputProps) {
  const sendMessage = useMessagesStore(
    (state) => state.sendMessage
  );

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    const content = text.trim();

    if (
      !content ||
      !conversationId ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      const response = await sendMessage(
        conversationId,
        content
      );

      if (response.error) {
        onError(String(response.error));
        return;
      }

      setText("");
      onSent();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  }, [
    text,
    conversationId,
    sending,
    sendMessage,
    onError,
    onSent,
  ]);

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);

      if (
        conversationId &&
        userId &&
        value.trim()
      ) {
        emitTyping(
          conversationId,
          userId
        );
      }
    },
    [conversationId, userId]
  );

  return (
    <View
      style={[
        styles.composerWrapper,
        {
          paddingBottom: 8,
        },
      ]}
    >
      <View style={styles.composerRow}>
        <TextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder="Type a message..."
          placeholderTextColor="#666666"
          multiline
          maxLength={5000}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
          style={styles.composerInput}
          editable={!sending}
        />

        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || sending}
          style={[
            styles.sendButton,
            (!text.trim() || sending) &&
              styles.sendButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {sending ? (
            <ActivityIndicator
              size="small"
              color="#000000"
            />
          ) : (
            <Ionicons
              name="send"
              size={19}
              color="#000000"
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}