import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  router,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import ChatBubble from "../../components/messaging/ChatBubble";
import ChatInput from "../../components/messaging/ChatInput";
import TypingIndicator from "../../components/messaging/TypingIndicator";
import { emitTyping, subscribeToConversation } from "../../utils/realtimeChat";
import { useAuthStore } from "../../stores/authStore";
import {
  Message,
  useMessagesStore,
} from "../../stores/messagesStore";
import { styles } from "../../styles/messaging/chat.styles";

const EMPTY_MESSAGES: Message[] = [];

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const conversationId = Array.isArray(id)
    ? id[0]
    : id;

  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore(
    (state) => state.loading
  );

  const conversations = useMessagesStore(
    (state) => state.conversations
  );

  const messages = useMessagesStore(
    (state) =>
      conversationId
        ? state.messages[conversationId] ?? EMPTY_MESSAGES
        : EMPTY_MESSAGES
  );

  const activeConversation = useMessagesStore(
    (state) => state.activeConversation
  );

  const loadConversations = useMessagesStore(
    (state) => state.loadConversations
  );

  const openConversation = useMessagesStore(
    (state) => state.openConversation
  );

  const appendMessage = useMessagesStore(
    (state) => state.appendMessage
  );

  const [typingUser, setTypingUser] =
  useState<string | null>(null);

  const [presence, setPresence] =
    useState<Record<string, unknown[]>>({});

  const [initializing, setInitializing] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [screenError, setScreenError] =
    useState<string | null>(null);

  const listRef =
    useRef<FlatList<Message>>(null);

  /*
   * Find the conversation from the loaded list.
   * activeConversation is also used as a fallback.
   */
  const conversation = useMemo(() => {
    if (!conversationId) {
      return null;
    }

    return (
      conversations.find(
        (item) => item.id === conversationId
      ) ??
      (activeConversation?.id === conversationId
        ? activeConversation
        : null)
    );
  }, [
    conversations,
    conversationId,
    activeConversation,
  ]);

  const conversationTitle =
    conversation?.title?.trim() || "Chat";

  /*
   * IMPORTANT:
   *
   * We are NOT using `inverted` here.
   *
   * The existing web application renders:
   *
   * messages.map(...)
   *
   * which means the API result is expected to be
   * displayed in the same order it is returned.
   *
   * Keeping inverted=false preserves that behaviour.
   */
  const scrollToLatest = useCallback(() => {
    if (messages.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }, [messages.length]);

  /*
   * Authentication.
   *
   * Do not redirect while AuthProvider/authStore is
   * still hydrating.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/(auth)/signin");
    }
  }, [authLoading, user]);

  /*
   * Initial conversation loading.
   *
   * Preserve the web sequence:
   *
   * loadConversations()
   *        ↓
   * openConversation(id)
   */
  useEffect(() => {
    if (
      authLoading ||
      !user?.id ||
      !conversationId
    ) {
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      try {
        setInitializing(true);
        setScreenError(null);

        const currentConversations =
          useMessagesStore.getState().conversations;

        if (currentConversations.length === 0) {
          await loadConversations();
        }

        if (cancelled) {
          return;
        }

        await openConversation(conversationId);

        if (!cancelled) {
          setInitializing(false);
        }
      } catch (error) {
        console.log(
          "[CHAT INITIALIZATION ERROR]",
          error
        );

        if (!cancelled) {
          setScreenError(
            error instanceof Error
              ? error.message
              : "Failed to open conversation"
          );

          setInitializing(false);
        }
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user?.id,
    conversationId,
    loadConversations,
    openConversation,
  ]);

  /*
   * Realtime subscription.
   */
  useEffect(() => {
    if (
      authLoading ||
      !user?.id ||
      !conversationId
    ) {
      return;
    }

    console.log(
      "[CHAT REALTIME INIT]",
      conversationId
    );

    const unsubscribe =
      subscribeToConversation({
        conversationId,
        userId: user.id,

        onMessage: (message) => {
          console.log(
            "[CHAT LIVE MESSAGE]",
            message
          );

          const messageConversationId =
            typeof message.conversation_id ===
            "string"
              ? message.conversation_id
              : conversationId;

          const messageId =
            typeof message.id === "string"
              ? message.id
              : null;

          /*
           * Prevent duplicate messages if the API
           * response and realtime INSERT both reach
           * the store.
           */
          const existingMessages =
            useMessagesStore.getState().messages[
              messageConversationId
            ] ?? [];

          if (
            messageId &&
            existingMessages.some(
              (item) => item.id === messageId
            )
          ) {
            return;
          }

          appendMessage(
            messageConversationId,
            message as Message
          );
        },

        onTyping: (data) => {
          console.log(
            "[CHAT TYPING EVENT]",
            data
          );

          if (
            data.state === "typing" &&
            data.user_id !== user.id
          ) {
            setTypingUser(data.user_id);
          }

          if (
            data.state === "stop" &&
            data.user_id !== user.id
          ) {
            setTypingUser(null);
          }
        },

        onPresence: (state) => {
          setPresence(
            state as Record<string, unknown[]>
          );
        },
      });

    return () => {
      unsubscribe();
      setTypingUser(null);
      setPresence({});
    };
  }, [
    authLoading,
    user?.id,
    conversationId,
    appendMessage,
  ]);

  /*
   * Automatically move to the latest message when
   * messages are loaded or a realtime message arrives.
   */
  useEffect(() => {
    if (!initializing && messages.length > 0) {
      scrollToLatest();
    }
  }, [
    messages.length,
    initializing,
    scrollToLatest,
  ]);

  const isOtherUserOnline = useMemo(() => {
    return Object.values(presence).some(
      (entries) =>
        Array.isArray(entries) &&
        entries.some((entry) => {
          const item =
            entry as {
              user_id?: string;
              online?: boolean;
            };

          return (
            item.user_id &&
            item.user_id !== user?.id &&
            item.online !== false
          );
        })
    );
  }, [presence, user?.id]);

  const statusText = typingUser
    ? "typing..."
    : isOtherUserOnline
      ? "online"
      : "offline";

  const handleRefresh = useCallback(
    async () => {
      if (!conversationId) {
        return;
      }

      try {
        setRefreshing(true);
        setScreenError(null);

        await openConversation(
          conversationId
        );
      } catch (error) {
        console.log(
          "[CHAT REFRESH ERROR]",
          error
        );

        setScreenError(
          error instanceof Error
            ? error.message
            : "Failed to refresh messages"
        );
      } finally {
        setRefreshing(false);
      }
    },
    [conversationId, openConversation]
  );

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color="#EDEDED"
        />

        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Redirecting to sign in...
        </Text>
      </View>
    );
  }

  if (!conversationId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Conversation not found
        </Text>

        <Text style={styles.errorText}>
          No conversation ID was provided.
        </Text>
      </View>
    );
  }

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color="#EDEDED"
        />

        <Text style={styles.loadingText}>
          Loading conversation...
        </Text>
      </View>
    );
  }

  if (screenError && messages.length === 0) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(
                insets.top,
                8
              ),
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#EDEDED"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {conversationTitle}
            </Text>
          </View>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            Couldn't load conversation
          </Text>

          <Text style={styles.errorText}>
            {screenError}
          </Text>

          <Pressable
            onPress={handleRefresh}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? insets.top
          : 0
      }
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(
              insets.top,
              8
            ),
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#EDEDED"
          />
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {conversationTitle}
          </Text>

          <Text
            style={[
              styles.headerStatus,
              typingUser &&
                styles.headerStatusTyping,
            ]}
          >
            {statusText}
          </Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item, index) =>
          item.id || `${conversationId}-${index}`
        }
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isMe={
              item.sender_id === user.id
            }
          />
        )}
        style={styles.messageList}
        contentContainerStyle={[
          styles.messageListContent,
          messages.length === 0 &&
            styles.emptyMessagesContainer,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        removeClippedSubviews={
          Platform.OS === "android"
        }
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#EDEDED"
          />
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyMessagesContainer
            }
          >
            <Text
              style={
                styles.emptyMessagesTitle
              }
            >
              No messages yet
            </Text>

            <Text
              style={
                styles.emptyMessagesText
              }
            >
              Send a message to start the
              conversation.
            </Text>
          </View>
        }
      />

      <TypingIndicator visible={!!typingUser} />

      {screenError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {screenError}
          </Text>
        </View>
      )}

      <ChatInput
        conversationId={conversationId}
        userId={user.id}
        bottomInset={insets.bottom}
        onError={setScreenError}
        onSent={() => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToEnd({
              animated: true,
            });
          });
        }}
      />
    </KeyboardAvoidingView>
  );
}