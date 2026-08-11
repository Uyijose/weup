did same error

36337514.jpg
 LOG  [SCREEN] Explore mounted
 LOG  [HEADER] Opening messages
 ERROR  [Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `WrappedScreenComponent`.] 

Code: _layout.tsx
  16 |           />
  17 |
> 18 |           <Stack
     |           ^
  19 |             screenOptions={{
  20 |               headerShown: false,
  21 |               animation: "fade",
Call Stack
  RootLayout (app\_layout.tsx:18:11)

  frontend-expo\app\_layout.tsx:
  import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

import AuthProvider from "../context/AuthProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
          />

          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
            }}
          />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

frontend-expo\app\chat\index.tsx:
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";

export default function MessagesScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000000",
        paddingTop: 60,
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 20,
        }}
      >
        Messages
      </Text>

      <Text
        style={{
          color: "#AAAAAA",
          fontSize: 16,
          marginBottom: 30,
        }}
      >
        Messages screen is working.
      </Text>

      <Pressable
        onPress={() => router.push("/chat/new")}
        style={{
          backgroundColor: "#FFFFFF",
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 10,
          alignSelf: "flex-start",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          New Message
        </Text>
      </Pressable>
    </View>
  );
}

