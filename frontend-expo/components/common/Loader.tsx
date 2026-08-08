import React from "react";
import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";

type LoaderProps = {
  message?: string;
};

export default function Loader({
  message = "Loading...",
}: LoaderProps) {
  console.log("[LOADER] Rendering loading state");

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
      }}
    >
      <ActivityIndicator
        size="small"
        color="#6A00F4"
      />

      <Text
        style={{
          marginTop: 12,
          color: "#888888",
          fontSize: 14,
        }}
      >
        {message}
      </Text>
    </View>
  );
}