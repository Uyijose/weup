import React, { useRef } from "react";
import { View } from "react-native";

import { ViewerPost } from "../../types/post";

import VideoPlayer from "./VideoPlayer";
import UserInfo from "./UserInfo";
import PostActions from "./PostActions";
import CommentSheet from "./CommentSheet";
import BottomSheet from "@gorhom/bottom-sheet";

import { postCardStyles } from "../../styles/feed/postCard.styles";

type PostCardProps = {
  post: ViewerPost;
  isActive: boolean;
};

export default function PostCard({
  post,
  isActive,
}: PostCardProps) {
  const commentSheetRef =
    useRef<BottomSheet>(null);

  function openComments() {
    commentSheetRef.current?.snapToIndex(
      0
    );
  }
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
        <PostActions
          post={post}
          onCommentPress={openComments}
        />
      </View>
      <CommentSheet
        ref={commentSheetRef}
        post={post}
      />
    </View>
  );
}