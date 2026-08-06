import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
} from "react-native";
import { styles } from "../../styles/auth/passwordInput.styles";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: string;
}

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Password",
  editable = true,
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputContainerError : undefined,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
          style={styles.input}
        />

        <Pressable
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eyeButton}
        >
          <Text style={styles.eyeText}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
}
