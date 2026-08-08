import React from "react";
import {
  Image,
  Text,
  View,
} from "react-native";

import { profileHeaderStyles } from "../../styles/profile/profileHeader.styles";

type ProfileUser = {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  verified?: boolean | null;
};

type Props = {
  user: ProfileUser;
  isOwner: boolean;
  isAdmin: boolean;
};

const FALLBACK_AVATAR =
  "https://placehold.co/200x200/png";

export default function ProfileHeader({
  user,
  isOwner,
  isAdmin,
}: Props) {
  const displayName =
    user.full_name?.trim() ||
    user.username ||
    "User";

  return (
    <View style={profileHeaderStyles.container}>
      <View style={profileHeaderStyles.avatarWrapper}>
        <Image
          source={{
            uri: user.avatar_url || FALLBACK_AVATAR,
          }}
          style={profileHeaderStyles.avatar}
        />
      </View>

      <View style={profileHeaderStyles.identity}>
        <View style={profileHeaderStyles.usernameRow}>
          <Text
            style={profileHeaderStyles.username}
            numberOfLines={1}
          >
            @{user.username || "user"}
          </Text>

          {user.verified && (
            <View style={profileHeaderStyles.verifiedBadge}>
              <Text style={profileHeaderStyles.verifiedText}>
                ✓
              </Text>
            </View>
          )}
        </View>

        <Text
          style={profileHeaderStyles.fullName}
          numberOfLines={1}
        >
          {displayName}
        </Text>

        <View style={profileHeaderStyles.roleRow}>
          {isOwner && (
            <Text style={profileHeaderStyles.roleText}>
              Your profile
            </Text>
          )}

          {!isOwner && isAdmin && (
            <Text style={profileHeaderStyles.roleText}>
              Admin view
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}