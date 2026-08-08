import React from "react";

import {
  Image,
  Text,
  View,
} from "react-native";

import { creatorHeaderStyles } from "../../styles/creator/creatorHeader.styles";

type Props = {
  avatarUrl?: string | null;
  platformTitle?: string | null;
  username?: string | null;
};

export default function CreatorHeader({
  avatarUrl,
  platformTitle,
  username,
}: Props) {
  return (
    <View style={creatorHeaderStyles.container}>
      <View style={creatorHeaderStyles.avatarWrapper}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={creatorHeaderStyles.avatar}
          />
        ) : (
          <View style={creatorHeaderStyles.avatarPlaceholder}>
            <Text style={creatorHeaderStyles.avatarPlaceholderText}>
              {(username?.charAt(0) || "C").toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={creatorHeaderStyles.info}>
        <Text
          numberOfLines={2}
          style={creatorHeaderStyles.platformTitle}
        >
          {platformTitle || "Creator"}
        </Text>

        <Text
          numberOfLines={1}
          style={creatorHeaderStyles.username}
        >
          @{username || "creator"}
        </Text>
      </View>
    </View>
  );
}