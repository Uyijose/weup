import React, {
  useEffect,
  useState,
} from "react";

import {
  Pressable,
  Text,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { ViewerPost } from "../../types/post";

import { likeButtonStyles } from "../../styles/feed/likeButton.styles";

type LikeButtonProps = {
  post: ViewerPost;
  onPress?: (
    liked: boolean
  ) => void;
};

export default function LikeButton({
  post,
  onPress,
}: LikeButtonProps) {
  const [liked, setLiked] =
    useState(false);

  const [count, setCount] =
    useState(post.likes_count);

  useEffect(() => {
    setCount(post.likes_count);
  }, [post.likes_count]);

  function toggleLike() {
    const next = !liked;

    setLiked(next);

    setCount((value) =>
      next ? value + 1 : Math.max(0, value - 1)
    );

    onPress?.(next);
  }

  return (
    <Pressable
      style={likeButtonStyles.container}
      onPress={toggleLike}
    >
      <Ionicons
        name={
          liked
            ? "heart"
            : "heart-outline"
        }
        size={34}
        color={
          liked
            ? "#FF2D55"
            : "#FFFFFF"
        }
      />

      <Text style={likeButtonStyles.text}>
        {count.toLocaleString()}
      </Text>
    </Pressable>
  );
}