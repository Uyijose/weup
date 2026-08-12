import React from "react";
import { Text, View } from "react-native";

import { styles } from "../../styles/messaging/chat.styles";

type TypingIndicatorProps = {
  visible: boolean;
};

export default function TypingIndicator({
  visible,
}: TypingIndicatorProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.typingContainer}>
      <Text style={styles.typingText}>
        Typing...
      </Text>
    </View>
  );
}