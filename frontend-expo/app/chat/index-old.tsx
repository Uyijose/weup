import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import ConversationItem from "../../components/messaging/ConversationItem";
import { useAuthStore } from "../../stores/authStore";
import { useMessagesStore } from "../../stores/messagesStore";
import { styles } from "../../styles/messaging/messages.styles";

export default function MessagesScreen() {
  const { user, loading: authLoading } = useAuthStore();

  const {
    conversations,
    loading,
    error,
    loadConversations,
  } = useMessagesStore();

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log("[MESSAGES] auth state", {
      authenticated: Boolean(user),
      authLoading,
    });
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading) {
      console.log("[MESSAGES] waiting for auth hydration");
      return;
    }

    if (!user) {
      console.log(
        "[MESSAGES] no authenticated user - redirecting"
      );

      router.replace("/(auth)/signin");
      return;
    }

    console.log(
      "[MESSAGES] authenticated - loading conversations"
    );

    loadConversations();
  }, [authLoading, user, loadConversations]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      (conversation.title ?? "")
        .toLowerCase()
        .includes(query)
    );
  }, [conversations, search]);

  const handleRefresh = async () => {
    if (!user) {
      return;
    }

    console.log("[MESSAGES] pull to refresh");

    setRefreshing(true);

    try {
      await loadConversations();
    } finally {
      setRefreshing(false);
    }
  };

  const handleConversationPress = (
    conversationId: string
  ) => {
    console.log(
      "[MESSAGES] opening conversation",
      conversationId
    );

    router.push(`/chat/${conversationId}`);
  };

  const handleNewMessage = () => {
    console.log("[MESSAGES] opening new message");

    router.push("/chat/new");
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color="#EDEDED"
        />

        <Text style={styles.loadingText}>
          Loading messages...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>
          Sign in to view messages
        </Text>

        <Text style={styles.authText}>
          Redirecting to sign in...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Messages
        </Text>

        <Pressable
          onPress={handleNewMessage}
          style={styles.newMessageButton}
          hitSlop={10}
        >
          <Ionicons
            name="create-outline"
            size={22}
            color="#EDEDED"
          />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#888888"
          style={styles.searchIcon}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations..."
          placeholderTextColor="#777777"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            style={styles.clearSearchButton}
            hitSlop={8}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color="#777777"
            />
          </Pressable>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable
            onPress={loadConversations}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      )}

      {loading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color="#EDEDED"
          />

          <Text style={styles.loadingText}>
            Loading conversations...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={() =>
                handleConversationPress(item.id)
              }
            />
          )}
          style={styles.list}
          contentContainerStyle={
            filteredConversations.length === 0
                ? styles.listEmptyContent
                : styles.contentContainer
            }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#EDEDED"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={30}
                  color="#888888"
                />
              </View>

              <Text style={styles.emptyTitle}>
                {search.trim()
                  ? "No conversations found"
                  : "No messages yet"}
              </Text>

              <Text style={styles.emptyText}>
                {search.trim()
                  ? "Try searching for another conversation."
                  : "Start a conversation with someone on WeUp."}
              </Text>

              {!search.trim() && (
                <Pressable
                  onPress={handleNewMessage}
                  style={styles.emptyAction}
                >
                  <Text style={styles.emptyActionText}>
                    New message
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}