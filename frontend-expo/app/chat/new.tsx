import React, {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  router,
} from "expo-router";
import {
  Ionicons,
} from "@expo/vector-icons";
import {
  useAuthStore,
} from "../../stores/authStore";
import {
  useMessagesStore,
} from "../../stores/messagesStore";
import {
  searchUsers,
  SearchUser,
} from "../../services/userSearch.service";

export default function NewMessageScreen() {
  const authUser = useAuthStore(
    (state) => state.user
  );

  const authLoading = useAuthStore(
    (state) => state.loading
  );

  const hydrateAuth = useAuthStore(
    (state) => state.hydrateAuth
  );

  const createConversation =
    useMessagesStore(
      (state) => state.createConversation
    );

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<SearchUser[]>([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [messageLoading, setMessageLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!authUser?.id) {
      router.replace("/(auth)/signin");
    }
  }, [authUser, authLoading]);

  useEffect(() => {
    const trimmedQuery =
      query.trim();

    setError(null);

    if (!trimmedQuery) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    const timeout = setTimeout(
      async () => {
        try {
          const users =
            await searchUsers(
              trimmedQuery
            );

          const filteredUsers =
            users.filter(
              (user) =>
                user.id !==
                authUser?.id
            );

          setResults(filteredUsers);
        } catch (error) {
          console.log(
            "[NEW MESSAGE SEARCH ERROR]",
            error
          );

          setResults([]);
          setError(
            "Unable to search users. Please try again."
          );
        } finally {
          setSearchLoading(false);
        }
      },
      300
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [query, authUser?.id]);

  const handleSelectUser = async (
    user: SearchUser
  ) => {
    if (
      messageLoading ||
      !authUser?.id
    ) {
      return;
    }

    try {
      setMessageLoading(true);
      setError(null);

      const response =
        await createConversation(
          [
            authUser.id,
            user.id,
          ],
          false,
          null
        );

      if (response.error) {
        console.log(
          "[NEW MESSAGE CREATE ERROR]",
          response.error
        );

        Alert.alert(
          "Unable to start conversation",
          "Please try again."
        );

        return;
      }

      const conversationId =
        response.conversation?.id;

      if (!conversationId) {
        Alert.alert(
          "Unable to start conversation",
          "The conversation could not be created. Please try again."
        );

        return;
      }

      router.replace({
        pathname: "/chat/[id]",
        params: {
          id: conversationId,
        },
      });
    } catch (error) {
      console.log(
        "[NEW MESSAGE CONVERSATION ERROR]",
        error
      );

      Alert.alert(
        "Message failed",
        "Unable to start this conversation. Please try again."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  const renderUser = ({
    item,
  }: {
    item: SearchUser;
  }) => {
    const displayName =
      item.full_name?.trim() ||
      item.username ||
      "User";

    return (
      <Pressable
        onPress={() =>
          handleSelectUser(item)
        }
        disabled={messageLoading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        {item.avatar_url ? (
          <Image
            source={{
              uri: item.avatar_url,
            }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor:
                "#222222",
            }}
          />
        ) : (
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor:
                "#222222",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              {displayName
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <View
          style={{
            flex: 1,
            marginLeft: 14,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {item.username
              ? `@${item.username}`
              : displayName}
          </Text>

          {item.full_name ? (
            <Text
              style={{
                color: "#AAAAAA",
                fontSize: 14,
                marginTop: 3,
              }}
            >
              {item.full_name}
            </Text>
          ) : null}

          {item.creator_username ? (
            <Text
              style={{
                color: "#777777",
                fontSize: 13,
                marginTop: 3,
              }}
            >
              @{item.creator_username}
            </Text>
          ) : null}
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#777777"
        />
      </Pressable>
    );
  };

  if (authLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#000000",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#1C1C1C",
        }}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "700",
            marginLeft: 8,
          }}
        >
          New Message
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#181818",
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 48,
          }}
        >
          <Ionicons
            name="search"
            size={20}
            color="#777777"
          />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search users"
            placeholderTextColor="#777777"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              flex: 1,
              color: "#FFFFFF",
              fontSize: 15,
              marginLeft: 10,
            }}
          />

          {query.length > 0 ? (
            <Pressable
              onPress={() =>
                setQuery("")
              }
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#777777"
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {searchLoading ? (
        <View
          style={{
            paddingVertical: 30,
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        </View>
      ) : null}

      {!searchLoading &&
      error ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
        >
          <Text
            style={{
              color: "#AAAAAA",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {error}
          </Text>
        </View>
      ) : null}

      {!searchLoading &&
      !error &&
      query.trim() &&
      results.length === 0 ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 40,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#888888",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            No users found.
          </Text>
        </View>
      ) : null}

      {!query.trim() &&
      !searchLoading ? (
        <View
          style={{
            paddingHorizontal: 30,
            paddingVertical: 50,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#777777",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Search for a username or name
            to start a conversation.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderUser}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      />

      {messageLoading ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor:
              "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#181818",
              borderRadius: 12,
              paddingHorizontal: 24,
              paddingVertical: 20,
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text
              style={{
                color: "#FFFFFF",
                marginTop: 10,
                fontSize: 14,
              }}
            >
              Opening conversation...
            </Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}