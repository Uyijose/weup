import React, { ReactNode, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import NotificationProvider from "./NotificationProvider";
import { registerForPushNotificationsAsync, registerDevicePushToken } from "../services/pushNotifications.service";
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
    if (loading || !user) {
      return;
    }

    console.log(
      "[PUSH REGISTRATION] Authenticated user detected:",
      user.id
    );

    registerForPushNotificationsAsync()
      .then(async (pushToken) => {
        console.log(
          "[PUSH REGISTRATION] Expo token result:",
          pushToken
        );

        if (!pushToken) {
          console.log(
            "[PUSH REGISTRATION] No push token received"
          );
          return;
        }

        const result =
          await registerDevicePushToken(pushToken);

        console.log(
          "[PUSH REGISTRATION] Device registration result:",
          result
        );
      })
      .catch((error) => {
        console.error(
          "[PUSH REGISTRATION] Registration failed:",
          error
        );
      });
  }, [user, loading]);

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