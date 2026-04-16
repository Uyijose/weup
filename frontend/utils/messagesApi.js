import { supabase } from "./supabaseClient";
import { getAuthToken } from "./getAuthToken";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function authHeaders() {
  const token = await getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function fetchConversations() {
  const res = await fetch(`${API_BASE}/messaging/conversations`, {
    headers: await authHeaders()
  });
  return res.json();
}

export async function fetchMessages(conversationId) {
  const res = await fetch(
    `${API_BASE}/messaging/conversations/${conversationId}/messages`,
    {
      headers: await authHeaders()
    }
  );
  return res.json();
}

export async function sendMessage(conversationId, content) {
  const res = await fetch(
    `${API_BASE}/messaging/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ content })
    }
  );
  return res.json();
}
