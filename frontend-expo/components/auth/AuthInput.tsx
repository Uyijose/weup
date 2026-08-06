import React from "react";
import {
  View,
  TextInput,
  Text,
  KeyboardTypeOptions,
} from "react-native";
import { styles } from "../../styles/auth/authInput.styles";

interface AuthInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  editable?: boolean;
  error?: string;
}

export default function AuthInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  secureTextEntry = false,
  editable = true,
  error,
}: AuthInputProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        editable={editable}
        style={[
          styles.input,
          error ? styles.inputError : undefined,
        ]}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
}
