import { getAuthToken } from "../utils/getAuthToken";

const API_BASE =
  process.env.EXPO_PUBLIC_BACKEND_URL;

type ConversationMember = {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
};

export type Conversation = {
  id: string;
  title?: string | null;
  is_group?: boolean;
  members?: ConversationMember[];
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count?: number | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type Message = {
  id: string;
  conversation_id?: string;
  sender_id?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type CreateConversationResponse = {
  conversation?: Conversation;
  error?: string;
  [key: string]: unknown;
};

export type SendMessageResponse = {
  message?: Message;
  error?: string;
  [key: string]: unknown;
};

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
  const response = await fetch(
    url,
    {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        ...(await authHeaders()),
      },
    }
  );

  const data =
    await response.json();

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

export async function fetchConversations() {
  if (!API_BASE) {
    return {
      conversations: [],
      error:
        "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/messaging/conversations`;

  console.log(
    "[MESSAGING SERVICE] FETCH CONVERSATIONS:",
    url
  );

  return requestJson(url);
}

export async function fetchMessages(
  conversationId: string
) {
  if (!API_BASE) {
    return {
      messages: [],
      error:
        "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/messaging/conversations/${conversationId}/messages`;

  console.log(
    "[MESSAGING SERVICE] FETCH MESSAGES:",
    url
  );

  return requestJson(url);
}

export async function sendMessage(
  conversationId: string,
  content: string
) {
  if (!API_BASE) {
    return {
      error:
        "Backend URL is not configured",
    };
  }

  const trimmedContent =
    content.trim();

  if (!trimmedContent) {
    return {
      error: "Message cannot be empty",
    };
  }

  const url =
    `${API_BASE}/api/messaging/conversations/${conversationId}/messages`;

  console.log(
    "[MESSAGING SERVICE] SEND MESSAGE:",
    {
      conversationId,
      content: trimmedContent,
    }
  );

  return requestJson(url, {
    method: "POST",
    body: JSON.stringify({
      content: trimmedContent,
    }),
  });
}

export async function createConversation(
  members: string[],
  isGroup = false,
  title: string | null = null
): Promise<CreateConversationResponse> {
  if (!API_BASE) {
    return {
      error:
        "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/messaging/conversations`;

  console.log(
    "[MESSAGING SERVICE] CREATE CONVERSATION:",
    {
      members,
      isGroup,
      title,
    }
  );

  return requestJson(url, {
    method: "POST",
    body: JSON.stringify({
      member_ids: members,
      is_group: isGroup,
      title,
    }),
  });
}