import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../styles/auth/authHeader.styles"

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AuthHeader({
  title,
  subtitle,
}: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>weup</Text>

      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}