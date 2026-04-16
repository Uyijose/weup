import { create } from "zustand";
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
