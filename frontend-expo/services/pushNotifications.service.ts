import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  console.log(
    "[PUSH] Starting push notification registration"
  );

  if (Platform.OS === "web") {
    console.log(
      "[PUSH] Web platform detected - skipping push registration"
    );

    return null;
  }

  const existingPermissions =
    await Notifications.getPermissionsAsync();

  console.log(
    "[PUSH] Existing permission:",
    existingPermissions.status
  );

  let finalStatus =
    existingPermissions.status;

  if (finalStatus !== "granted") {
    const requestedPermissions =
      await Notifications.requestPermissionsAsync();

    finalStatus =
      requestedPermissions.status;

    console.log(
      "[PUSH] Requested permission:",
      finalStatus
    );
  }

  if (finalStatus !== "granted") {
    console.log(
      "[PUSH] Notification permission was not granted"
    );

    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  console.log(
    "[PUSH] Project ID:",
    projectId
  );

  if (!projectId) {
    console.error(
      "[PUSH] EAS project ID is missing"
    );

    return null;
  }

  try {
    const token =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    console.log(
      "[PUSH] Expo push token:",
      token.data
    );

    return token.data;
  } catch (error) {
    console.error(
      "[PUSH] Failed to get Expo push token:",
      error
    );

    return null;
  }
}

export async function registerDevicePushToken(
  pushToken: string
) {
  const API_BASE =
    process.env.EXPO_PUBLIC_BACKEND_URL;

  if (!API_BASE) {
    console.error(
      "[PUSH] Backend URL is missing"
    );

    return null;
  }

  const { getAuthToken } =
    await import("../utils/getAuthToken");

  const token = await getAuthToken();

  if (!token) {
    console.log(
      "[PUSH] No auth token available"
    );

    return null;
  }

  const url =
    `${API_BASE}/api/devices/register`;

  console.log(
    "[PUSH] Registering token with backend:",
    url
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pushToken,
      platform: Platform.OS,
      deviceName: null,
    }),
  });

  const data = await response.json();

  console.log(
    "[PUSH] Backend registration response:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Failed to register push token"
    );
  }

  return data;
}