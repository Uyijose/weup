import React from "react";
import {
  Text,
  View,
} from "react-native";

type EmptyStateProps = {
  title: string;
  message?: string;
};

export default function EmptyState({
  title,
  message,
}: EmptyStateProps) {
  console.log("[EMPTY STATE] Rendering:", title);

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
      }}
    >
      <Text
        style={{
          color: "#EDEDED",
          fontSize: 18,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      {message ? (
        <Text
          style={{
            marginTop: 8,
            color: "#888888",
            fontSize: 14,
            lineHeight: 20,
            textAlign: "center",
          }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}