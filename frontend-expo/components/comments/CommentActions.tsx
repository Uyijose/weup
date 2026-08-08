import React from "react";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import { commentActionsStyles } from "../../styles/comments/commentActions.styles";

type Props = {
  isOwner?: boolean;
};

export default function CommentActions({
  isOwner = false,
}: Props) {
  return (
    <View
      style={commentActionsStyles.container}
    >
      <Pressable
        style={commentActionsStyles.action}
        onPress={() =>
          console.log("Like Comment")
        }
      >
        <Text
          style={commentActionsStyles.text}
        >
          Like
        </Text>
      </Pressable>

      <Pressable
        style={commentActionsStyles.action}
        onPress={() =>
          console.log("Report Comment")
        }
      >
        <Text
          style={commentActionsStyles.text}
        >
          Report
        </Text>
      </Pressable>

      {isOwner && (
        <>
          <Pressable
            style={
              commentActionsStyles.action
            }
            onPress={() =>
              console.log("Edit Comment")
            }
          >
            <Text
              style={
                commentActionsStyles.text
              }
            >
              Edit
            </Text>
          </Pressable>

          <Pressable
            style={
              commentActionsStyles.action
            }
            onPress={() =>
              console.log(
                "Delete Comment"
              )
            }
          >
            <Text
              style={
                commentActionsStyles.text
              }
            >
              Delete
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}