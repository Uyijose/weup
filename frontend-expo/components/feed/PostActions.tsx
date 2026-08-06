import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ViewerPost } from "../../types/post";
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import { postActionsStyles } from "../../styles/feed/postActions.styles";

type Props = {
  post: ViewerPost;
};

export default function PostActions({
  post,
}: Props) {
  return (
    <View style={postActionsStyles.container}>
      <LikeButton post={post} />

      <Pressable style={postActionsStyles.button}>
        <Ionicons
          name="chatbubble-outline"
          size={34}
          color="#FFFFFF"
        />
        <Text style={postActionsStyles.count}>
          {post.comments_count.toLocaleString()}
        </Text>
      </Pressable>

      <ShareButton post={post} />

      <Pressable style={postActionsStyles.button}>
        <Ionicons
          name="flag-outline"
          size={34}
          color="#FFFFFF"
        />
      </Pressable>

      <Pressable style={postActionsStyles.button}>
        <Ionicons
          name="paper-plane-outline"
          size={34}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}