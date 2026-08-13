import React, { ReactNode, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import NotificationProvider from "./NotificationProvider";
import { useAuthStore } from "../stores/authStore";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const router = useRouter();
  const segments = useSegments();

  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const listenToAuthChanges = useAuthStore(
    (state) => state.listenToAuthChanges
  );

  useEffect(() => {
    hydrateAuth();

    const subscription = listenToAuthChanges();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/signin");
      return;
    }

    if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}