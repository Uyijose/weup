import { Stack } from "expo-router";

console.log("[AUTH LAYOUT] Loaded");

export default function AuthLayout() {
  console.log("[AUTH LAYOUT] Rendering");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}