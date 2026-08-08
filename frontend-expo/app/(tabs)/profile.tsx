import React, { useEffect } from "react";

import { ActivityIndicator, SafeAreaView } from "react-native";

import { router } from "expo-router";

import { useAuthStore } from "../../stores/authStore";

export default function ProfileTab() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user?.id) {
      router.replace("/(auth)/signin");
      return;
    }

    router.replace({
      pathname: "/user/[id]",
      params: {
        id: String(user.id),
      },
    });
  }, [loading, user?.id]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator
        size="large"
        color="#6A00F4"
      />
    </SafeAreaView>
  );
}