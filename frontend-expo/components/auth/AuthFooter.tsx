import React from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "../../styles/auth/authFooter.styles";

interface AuthFooterProps {
  text: string;
  actionText: string;
  onPress: () => void;
}

export default function AuthFooter({
  text,
  actionText,
  onPress,
}: AuthFooterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>

      <Pressable onPress={onPress}>
        <Text style={styles.link}>{actionText}</Text>
      </Pressable>
    </View>
  );
}