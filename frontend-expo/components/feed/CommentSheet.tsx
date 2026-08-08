import React, {
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Text,
} from "react-native";

import BottomSheet, {
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { ViewerPost } from "../../types/post";
import CommentList from "../comments/CommentList";
import CommentInput from "../comments/CommentInput";
import {
  getComments,
} from "../../services/comments.service";

import {
  commentSheetStyles,
} from "../../styles/feed/commentSheet.styles";


type Props = {
  post: ViewerPost;
};

const CommentSheet =
  forwardRef<
    BottomSheet,
    Props
  >(({ post }, ref) => {
    const snapPoints =
      useMemo(
        () => ["50%", "85%"],
        []
      );

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      comments,
      setComments,
    ] = useState<any[]>([]);

    useEffect(() => {
      async function load() {
        try {
          const result =
            await getComments(
              post.id
            );

          setComments(result);
        } finally {
          setLoading(false);
        }
      }

      load();
    }, [post.id]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView
          style={
            commentSheetStyles.container
          }
        >
          <Text
            style={
              commentSheetStyles.header
            }
          >
            Comments
          </Text>

          <CommentList
            comments={comments}
            loading={loading}
          />
        <CommentInput
          onSend={async (text) => {
            console.log(text);
          }}
        />
        </BottomSheetView>
      </BottomSheet>
    );
  });

export default CommentSheet;