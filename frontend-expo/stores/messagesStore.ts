import { create } from "zustand";
import {
  createConversation as createConversationApi,
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageApi,
} from "../services/messaging.service";

import type {
  Conversation,
  Message,
} from "../services/messaging.service";

import type {
  CreateConversationResponse,
  SendMessageResponse,
} from "../services/messaging.service";

export type {
  Conversation,
  Message,
} from "../services/messaging.service";

type MessagesState = {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation: Conversation | null;
  loading: boolean;
  error: string | null;

  loadConversations: () => Promise<void>;

  createConversation: (
    members: string[],
    isGroup?: boolean,
    title?: string | null
  ) => Promise<CreateConversationResponse>;

  openConversation: (
    conversationId: string
  ) => Promise<void>;

  appendMessage: (
    conversationId: string,
    message: Message
  ) => void;

  sendMessage: (
    conversationId: string,
    content: string
  ) => Promise<SendMessageResponse>;
};

export const useMessagesStore = create<MessagesState>(
  (set, get) => ({
    conversations: [],
    messages: {},
    activeConversation: null,
    loading: false,
    error: null,

    loadConversations: async () => {
      try {
        console.log("[MESSAGES] loading conversations");

        set({
          loading: true,
          error: null,
        });

        const res =
          await fetchConversations();

        if (res.error) {
          set({
            loading: false,
            error: String(res.error),
          });
          return;
        }

        set({
          conversations: res.conversations ?? [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.log(
          "[LOAD CONVERSATIONS ERROR]",
          error
        );

        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load conversations",
        });
      }
    },

    createConversation: async (
      members,
      isGroup = false,
      title = null
    ) => {
      try {
        const data =
          await createConversationApi(
            members,
            isGroup,
            title
          );

        if (data.error) {
          return data;
        }

        if (data.conversation) {
          set((state) => ({
            conversations: [
              data.conversation!,
              ...state.conversations.filter(
                (conversation) =>
                  conversation.id !==
                  data.conversation!.id
              ),
            ],
          }));
        }

        return data;
      } catch (error) {
        console.log(
          "[CREATE CONVERSATION ERROR]",
          error
        );

        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to create conversation",
        };
      }
    },

    openConversation: async (conversationId) => {
      console.log(
        "[OPEN CONVERSATION INIT]",
        conversationId
      );

      try {
        set({
          loading: true,
          error: null,
        });

        const res =
          await fetchMessages(
            conversationId
          );

        if (res.error) {
          set({
            loading: false,
            error: String(res.error),
          });
          return;
        }

        const convoFromList =
          get().conversations.find(
            (conversation) =>
              conversation.id === conversationId
          );

        console.log(
          "[CONVERSATION FROM STORE]",
          convoFromList
        );

        set((state) => ({
          activeConversation:
            convoFromList ??
            state.activeConversation,

          messages: {
            ...state.messages,
            [conversationId]:
              res.messages ?? [],
          },

          loading: false,
          error: null,
        }));
      } catch (error) {
        console.log(
          "[OPEN CONVERSATION ERROR]",
          error
        );

        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to open conversation",
        });
      }
    },

    appendMessage: (
      conversationId,
      message
    ) => {
      console.log(
        "[STORE APPEND MESSAGE]",
        message
      );

      set((state) => {
        const existingMessages =
          state.messages[conversationId] ?? [];

        const alreadyExists =
          existingMessages.some(
            (item) => item.id === message.id
          );

        if (alreadyExists) {
          return state;
        }

        return {
          messages: {
            ...state.messages,
            [conversationId]: [
              ...existingMessages,
              message,
            ],
          },
        };
      });
    },

    sendMessage: async (
      conversationId,
      content
    ) => {
      try {
        const trimmedContent =
          content.trim();

        if (!trimmedContent) {
          return {
            error: "Message cannot be empty",
          };
        }

        const res =
          await sendMessageApi(
            conversationId,
            trimmedContent
          );

        console.log(
          "[SEND MESSAGE RESPONSE]",
          {
            conversationId,
            message: res.message,
          }
        );

        return res;
      } catch (error) {
        console.log(
          "[SEND MESSAGE ERROR]",
          error
        );

        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to send message",
        };
      }
    },
  })
);