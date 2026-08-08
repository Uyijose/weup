import React from "react";

import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from "react-native";

import CommentItem from "./CommentItem";

type Props = {
  comments: any[];
  loading: boolean;
};

export default function CommentList({
  comments,
  loading,
}: Props) {
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>
          No comments yet.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) =>
        item.id
      }
      renderItem={({ item }) => (
        <CommentItem
          comment={item}
        />
      )}
      showsVerticalScrollIndicator={
        false
      }
    />
  );
}