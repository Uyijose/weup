import React, {
  forwardRef,
  useMemo,
} from "react";

import {
  View,
  Text,
} from "react-native";

import BottomSheet, {
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { ViewerPost } from "../../types/post";

import { commentSheetStyles } from "../../styles/feed/commentSheet.styles";

type Props = {
  post: ViewerPost;
};

const CommentSheet = forwardRef<
  BottomSheet,
  Props
>(({ post }, ref) => {
  const snapPoints = useMemo(
    () => ["50%", "85%"],
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <BottomSheetView
        style={commentSheetStyles.container}
      >
        <Text
          style={commentSheetStyles.header}
        >
          Comments
        </Text>

        <View
          style={commentSheetStyles.list}
        >
          <Text
            style={
              commentSheetStyles.emptyText
            }
          >
            Comments for post:
          </Text>

          <Text
            style={
              commentSheetStyles.postId
            }
          >
            {post.id}
          </Text>
        </View>

        <View
          style={
            commentSheetStyles.inputArea
          }
        >
          <Text
            style={
              commentSheetStyles.placeholder
            }
          >
            Comment input coming soon...
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default CommentSheet;