import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { searchAccountCardStyles } from "../../styles/search/searchAccountCard.styles";

export type CreatorAccount = {
  id: string;
  creator_username: string | null;
  creator_avatar_url: string | null;
};

type SearchAccountCardProps = {
  user: CreatorAccount;
};

const FALLBACK_AVATAR =
  "https://via.placeholder.com/100";

export default function SearchAccountCard({
  user,
}: SearchAccountCardProps) {
  const handlePress = () => {
    if (!user.id) {
      return;
    }

    router.push(`/creator/${user.id}`);
  };

  const username =
    user.creator_username || "Creator";

  return (
    <Pressable
      onPress={handlePress}
      style={searchAccountCardStyles.container}
    >
      <Image
        source={{
          uri:
            user.creator_avatar_url ||
            FALLBACK_AVATAR,
        }}
        style={searchAccountCardStyles.avatar}
      />

      <View style={searchAccountCardStyles.info}>
        <Text
          style={searchAccountCardStyles.username}
          numberOfLines={1}
        >
          {username}
        </Text>

        <Text
          style={searchAccountCardStyles.label}
        >
          Creator
        </Text>
      </View>

      <Text style={searchAccountCardStyles.arrow}>
        ›
      </Text>
    </Pressable>
  );
}