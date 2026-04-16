import { supabase } from "./supabaseClient";
import { getAuthToken } from "./getAuthToken";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

async function authHeaders() {
  const token = await getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function fetchConversations() {
  const url = `${API_BASE}/api/messaging/conversations`;

    console.log("[FETCH CONVERSATIONS] URL:", url);

    const res = await fetch(url, {
        headers: await authHeaders()
        });

        console.log("[FETCH CONVERSATIONS] STATUS:", res.status);

        const data = await res.json();
        console.log("[FETCH CONVERSATIONS] RESPONSE:", data);

        if (!res.ok) {
        console.log("[FETCH CONVERSATIONS] FAILED:", data);
        }

    return data;
}

export async function fetchMessages(conversationId) {
  const url = `${API_BASE}/api/messaging/conversations/${conversationId}/messages`;

  console.log("[FETCH MESSAGES] URL:", url);

  const res = await fetch(url, {
    headers: await authHeaders()
  });

  console.log("[FETCH MESSAGES] STATUS:", res.status);

  const data = await res.json();

  console.log("[FETCH MESSAGES] RESPONSE:", data);

  if (!res.ok) {
    console.log("[FETCH MESSAGES] FAILED RESPONSE:", data);
  }

  return data;
}

export async function sendMessage(conversationId, content) {
  const url = `${API_BASE}/api/messaging/conversations/${conversationId}/messages`;

  console.log("[SEND MESSAGE] URL:", url);
  console.log("[SEND MESSAGE] PAYLOAD:", { conversationId, content });

  const res = await fetch(url, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ content })
  });

  console.log("[SEND MESSAGE] STATUS:", res.status);

  const data = await res.json();

  console.log("[SEND MESSAGE] RESPONSE:", data);

  if (!res.ok) {
    console.log("[SEND MESSAGE] FAILED RESPONSE:", data);
  }

  return data;
}
