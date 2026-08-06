import React, {
  useState,
} from "react";

import {
  Pressable,
  Share,
  Text,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { ViewerPost } from "../../types/post";

import { shareButtonStyles } from "../../styles/feed/shareButton.styles";

type ShareButtonProps = {
  post: ViewerPost;
};

export default function ShareButton({
  post,
}: ShareButtonProps) {
  const [shareCount, setShareCount] =
    useState(
      (post as any).shares_count ?? 0
    );

  async function handleShare() {
    try {
      const result =
        await Share.share({
          title: post.caption ?? undefined,
          message:
            post.video_url ||
            post.caption ||
            "Check out this post!",
        });

      if (
        result.action ===
        Share.sharedAction
      ) {
        setShareCount(
          (value: number) => value + 1
        );
      }
    } catch (error) {
      console.log(
        "[SHARE]",
        error
      );
    }
  }

  return (
    <Pressable
      style={
        shareButtonStyles.container
      }
      onPress={handleShare}
    >
      <Ionicons
        name="paper-plane-outline"
        size={34}
        color="#FFFFFF"
      />

      <Text
        style={shareButtonStyles.text}
      >
        {shareCount > 0
          ? shareCount.toLocaleString()
          : "Share"}
      </Text>
    </Pressable>
  );
}