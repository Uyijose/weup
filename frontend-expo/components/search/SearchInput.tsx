import React, { useEffect, useState } from "react";
import {
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchInputStyles } from "../../styles/search/searchInput.styles";

type SearchInputProps = {
  value: string;
  onSubmit: (query: string) => void;
};

export default function SearchInput({
  value,
  onSubmit,
}: SearchInputProps) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleSubmit = () => {
    const query = text.trim();

    if (!query) {
      return;
    }

    onSubmit(query);
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <View style={searchInputStyles.container}>
      <Ionicons
        name="search-outline"
        size={21}
        color="#999999"
      />

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Search creators, topics, captions..."
        placeholderTextColor="#888888"
        style={searchInputStyles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSubmit}
      />

      {text.length > 0 ? (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          style={searchInputStyles.clearButton}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color="#888888"
          />
        </Pressable>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        style={searchInputStyles.searchButton}
        hitSlop={6}
      >
        <Ionicons
          name="arrow-forward"
          size={20}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}