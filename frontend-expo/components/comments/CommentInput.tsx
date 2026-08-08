import React, {
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { commentInputStyles } from "../../styles/comments/commentInput.styles";

type Props = {
  onSend: (text: string) => Promise<void>;
};

const MAX_LENGTH = 500;

export default function CommentInput({
  onSend,
}: Props) {
  const [text, setText] =
    useState("");

  const [sending, setSending] =
    useState(false);

  async function handleSend() {
    const value = text.trim();

    if (!value || sending) {
      return;
    }

    setSending(true);

    try {
      await onSend(value);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View
        style={
          commentInputStyles.container
        }
      >
        <View
          style={commentInputStyles.row}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add a comment..."
            multiline
            maxLength={MAX_LENGTH}
            style={
              commentInputStyles.input
            }
          />

          <Pressable
            onPress={handleSend}
            disabled={
              sending ||
              !text.trim()
            }
            style={[
              commentInputStyles.sendButton,
              (sending ||
                !text.trim()) &&
                commentInputStyles.disabled,
            ]}
          >
            <Text
              style={
                commentInputStyles.sendText
              }
            >
              Send
            </Text>
          </Pressable>
        </View>

        <Text
          style={
            commentInputStyles.counter
          }
        >
          {text.length}/{MAX_LENGTH}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}