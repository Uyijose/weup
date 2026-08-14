import React, {
  useEffect,
} from "react";

import {
  Pressable,
  Text,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { ViewerPost } from "../../types/post";
import { useLikesStore } from "../../stores/likesStore";
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
  const likeState =
    useLikesStore(
      (state) => state.likesMap[post.id]
    );

  const fetchLikeState =
    useLikesStore(
      (state) => state.fetchLikeState
    );

  const toggleLike =
    useLikesStore(
      (state) => state.toggleLike
    );

  const liked =
    likeState?.hasLiked ?? false;

  useEffect(() => {
    console.log(
      "[LIKE BUTTON] Loading like state",
      post.id
    );

    fetchLikeState(
      post.id,
      false
    );
  }, [
    post.id,
    fetchLikeState,
  ]);

  const handleLike = async () => {
    console.log(
      "[LIKE BUTTON] Pressed",
      {
        postId: post.id,
        currentlyLiked: liked,
      }
    );

    try {
      const response =
        await toggleLike(
          post.id,
          false
        );

      console.log(
        "[LIKE BUTTON] Backend response",
        response
      );

      if (response?.liked !== undefined) {
        onPress?.(
          response.liked
        );
      }
    } catch (error: any) {
      console.error(
        "[LIKE BUTTON] ERROR",
        {
          message: error?.message,
          response:
            error?.response?.data,
          status:
            error?.response?.status,
        }
      );
    }
  };

  return (
    <Pressable
      style={
        likeButtonStyles.container
      }
      onPress={handleLike}
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

      <Text
        style={
          likeButtonStyles.text
        }
      >
        {post.likes_count.toLocaleString()}
      </Text>
    </Pressable>
  );
}