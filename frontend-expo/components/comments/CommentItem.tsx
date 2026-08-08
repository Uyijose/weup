import React from "react";

import {
  Image,
  Text,
  View,
} from "react-native";
import CommentActions from "./CommentActions";

type Props = {
  comment: any;
};

export default function CommentItem({
  comment,
}: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 20,
      }}
    >
      <Image
        source={{
          uri:
            comment.users?.avatar_url ??
            "https://placehold.co/100",
        }}
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          marginRight: 12,
        }}
      />

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              marginRight: 6,
            }}
          >
            @
            {comment.users?.username ??
              "Unknown"}
          </Text>

          {comment.users?.verified && (
            <Text>
              ✔️
            </Text>
          )}
        </View>

        <Text
          style={{
            color: "#222",
            marginTop: 4,
          }}
        >
          {comment.comment}
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginTop: 6,
          }}
        >
          <Text
            style={{
              color: "#777",
              fontSize: 12,
            }}
          >
            {new Date(
              comment.created_at
            ).toLocaleString()}
          </Text>

          <Text
            style={{
              marginLeft: 16,
              color: "#777",
              fontSize: 12,
            }}
          >
            ❤️{" "}
            {comment.likes_count ??
              0}
          </Text>
        </View>
        <CommentActions
          isOwner={false}
        />
      </View>
    </View>
  );
}