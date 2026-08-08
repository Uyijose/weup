import { create } from "zustand";
import { supabase } from "../lib/supabase";
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageApi,
} from "../utils/messagesApi";

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

type FetchConversationsResponse = {
  conversations?: Conversation[];
};

type FetchMessagesResponse = {
  messages?: Message[];
};

type SendMessageResponse = {
  message?: Message;
  [key: string]: unknown;
};

type CreateConversationResponse = {
  conversation?: Conversation;
  error?: string;
  [key: string]: unknown;
};

type MessagesState = {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation: Conversation | null;
  loading: boolean;

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

    loadConversations: async () => {
      try {
        set({ loading: true });

        const res =
          (await fetchConversations()) as FetchConversationsResponse;

        set({
          conversations: res.conversations ?? [],
          loading: false,
        });
      } catch (error) {
        console.log(
          "[LOAD CONVERSATIONS ERROR]",
          error
        );

        set({
          loading: false,
        });
      }
    },

    createConversation: async (
      members,
      isGroup = false,
      title = null
    ) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      console.log(
        "[CREATE CONVERSATION] session:",
        session
      );

      console.log(
        "[CREATE CONVERSATION] token:",
        token
      );

      if (!token) {
        console.log(
          "[CREATE CONVERSATION] NO TOKEN FOUND"
        );

        return {
          error: "No auth session",
        };
      }

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/messaging/conversations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              member_ids: members,
              is_group: isGroup,
              title,
            }),
          }
        );

        const data =
          (await response.json()) as CreateConversationResponse;

        console.log(
          "[CREATE CONVERSATION RESPONSE]",
          data
        );

        if (response.status === 401) {
          console.log(
            "[CREATE CONVERSATION] Unauthorized - invalid session token"
          );
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
          error: "Failed to create conversation",
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
        });

        const res =
          (await fetchMessages(
            conversationId
          )) as FetchMessagesResponse;

        console.log(
          "[OPEN CONVERSATION FETCH]",
          {
            conversationId,
            messages: res.messages?.length ?? 0,
          }
        );

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
        }));
      } catch (error) {
        console.log(
          "[OPEN CONVERSATION ERROR]",
          error
        );

        set({
          loading: false,
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

      set((state) => ({
        messages: {
          ...state.messages,

          [conversationId]: [
            ...(state.messages[
              conversationId
            ] ?? []),

            message,
          ],
        },
      }));
    },

    sendMessage: async (
      conversationId,
      content
    ) => {
      try {
        const res =
          (await sendMessageApi(
            conversationId,
            content
          )) as SendMessageResponse;

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