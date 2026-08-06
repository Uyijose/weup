import React from "react";
import { View } from "react-native";

import { ViewerPost } from "../../types/post";

import VideoPlayer from "./VideoPlayer";
import UserInfo from "./UserInfo";
import PostActions from "./PostActions";

import { postCardStyles } from "../../styles/feed/postCard.styles";

type PostCardProps = {
  post: ViewerPost;
  isActive: boolean;
};

export default function PostCard({
  post,
  isActive,
}: PostCardProps) {
  return (
    <View style={postCardStyles.container}>
      <View style={postCardStyles.videoContainer}>
        <VideoPlayer
          post={post}
          isActive={isActive}
        />
      </View>

      <View style={postCardStyles.overlay}>
        <UserInfo post={post} />
        <PostActions post={post} />
      </View>
    </View>
  );
}