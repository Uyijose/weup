import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";
import {
  fetchConversations,
  fetchMessages,
  sendMessage
} from "../utils/messagesApi";

export const useMessagesStore = create((set, get) => ({
  conversations: [],
  messages: {},
  activeConversation: null,
  loading: false,

  loadConversations: async () => {
    set({ loading: true });
    const res = await fetchConversations();

    set({
      conversations: res.conversations || [],
      loading: false
    });
  },

  createConversation: async (members, isGroup = false, title = null) => {
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    console.log("[CREATE CONVERSATION] session:", session);
    console.log("[CREATE CONVERSATION] token:", token);

    if (!token) {
      console.log("[CREATE CONVERSATION] NO TOKEN FOUND");
      return { error: "No auth session" };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messaging/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        member_ids: members,
        is_group: isGroup,
        title
      })
    });

    const data = await res.json();

    console.log("[CREATE CONVERSATION RESPONSE]", data);

    if (res.status === 401) {
      console.log("[CREATE CONVERSATION] Unauthorized - invalid session token");
    }

    if (data?.conversation) {
      set((state) => ({
        conversations: [data.conversation, ...state.conversations]
      }));
    }

    return data;
  },

  openConversation: async (conversationId) => {
    set({ loading: true, activeConversation: conversationId });

    const res = await fetchMessages(conversationId);

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: res.messages || []
      },
      loading: false
    }));
  },

  sendMessage: async (conversationId, content) => {
    const res = await sendMessage(conversationId, content);

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          res.message
        ]
      }
    }));
  }
}));
