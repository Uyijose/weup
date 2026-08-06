import React from "react";

import {
  Text,
  View,
} from "react-native";

import { ViewerPost } from "../../types/post";

import { styles } from "../../styles/feed/tags.styles";

type TagsProps = {
  post: ViewerPost;
};

export default function Tags({
  post,
}: TagsProps) {
  return (
    <View style={styles.container}>
      {!!post.company && (
        <View style={styles.tag}>
          <Text style={styles.text}>
            🏢 {post.company}
          </Text>
        </View>
      )}

      {!!post.song_name && (
        <View style={styles.tag}>
          <Text style={styles.text}>
            🎵 {post.song_name}
          </Text>
        </View>
      )}
    </View>
  );
}