import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
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

    console.log("[HEADER SEARCH]", query);

    setSearchOpen(false);
    setSearchQuery("");

    router.push({
      pathname: "/search",
      params: {
        q: query,
      },
    });
  };

  const handleOpenMessages = () => {
    console.log("[HEADER] Opening messages");

    router.push("/chat");
  };

  return (
    <View style={styles.container}>
      {searchOpen ? (
        <View style={styles.headerSearchContainer}>
          <Pressable
            onPress={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            style={styles.headerBackButton}
            hitSlop={10}
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
            style={styles.headerSearchInput}
          />

          <Pressable
            onPress={handleSearch}
            style={styles.headerSearchSubmitButton}
            hitSlop={10}
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
          <Text style={styles.logo}>WeUp</Text>

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
              onPress={handleOpenMessages}
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