import { getAuthToken } from "../utils/getAuthToken";
import type {
  Notification,
} from "../types/notification";

const API_BASE =
  process.env.EXPO_PUBLIC_BACKEND_URL;

async function authHeaders() {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No auth session");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function requestJson(
  url: string,
  options?: RequestInit
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      ...(await authHeaders()),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ...data,
      error:
        data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`,
    };
  }

  return data;
}

export async function fetchNotifications(
  limit = 50
): Promise<{
  notifications?: Notification[];
  error?: string;
}> {
  if (!API_BASE) {
    return {
      notifications: [],
      error: "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/notifications?limit=${limit}`;

  console.log(
    "[NOTIFICATIONS SERVICE] FETCH:",
    url
  );

  return requestJson(url);
}

export async function fetchUnreadNotificationCount(): Promise<{
  unreadCount?: number;
  error?: string;
}> {
  if (!API_BASE) {
    return {
      unreadCount: 0,
      error: "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/notifications/unread-count`;

  console.log(
    "[NOTIFICATIONS SERVICE] UNREAD COUNT:",
    url
  );

  return requestJson(url);
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<{
  notification?: Notification;
  error?: string;
}> {
  if (!API_BASE) {
    return {
      error: "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/notifications/${notificationId}/read`;

  return requestJson(url, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<{
  notifications?: Notification[];
  error?: string;
}> {
  if (!API_BASE) {
    return {
      notifications: [],
      error: "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/notifications/read-all`;

  return requestJson(url, {
    method: "PATCH",
  });
}