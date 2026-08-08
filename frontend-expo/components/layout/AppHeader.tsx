import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles } from "../../styles/layout/appHeader.styles";

export default function AppHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    setSearchOpen(false);
    setSearchQuery("");

    router.push({
      pathname: "/search",
      params: {
        q: query,
      },
    });
  };

  return (
    <View style={styles.container}>
      {searchOpen ? (
        <View style={localStyles.searchContainer}>
          <Pressable
            onPress={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            style={localStyles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#EDEDED"
            />
          </Pressable>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search creators, topics, captions..."
            placeholderTextColor="#888888"
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            style={localStyles.searchInput}
          />

          <Pressable
            onPress={handleSearch}
            style={localStyles.searchSubmitButton}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color="#EDEDED"
            />
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.logo}>
            WeUp
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={() => setSearchOpen(true)}
              hitSlop={10}
            >
              <Ionicons
                name="search-outline"
                size={24}
                color="#EDEDED"
              />
            </Pressable>

            <Pressable
              onPress={() => router.push("/chat/new")}
              hitSlop={10}
            >
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color="#EDEDED"
              />
            </Pressable>

            <Pressable hitSlop={10}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#EDEDED"
              />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  backButton: {
    padding: 4,
  },

  searchInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1E1E1E",
    color: "#EDEDED",
    fontSize: 15,
  },

  searchSubmitButton: {
    padding: 6,
  },
});