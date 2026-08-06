import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
} from "react-native";
import { styles } from "../../styles/auth/googleButton.styles";

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function GoogleButton({
  onPress,
  loading = false,
  disabled = false,
}: GoogleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#111827" />
      ) : (
        <>
          <Text style={styles.googleIcon}>G</Text>

          <Text style={styles.text}>
            Continue with Google
          </Text>
        </>
      )}
    </Pressable>
  );
}