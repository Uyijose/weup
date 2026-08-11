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