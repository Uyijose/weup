import React from "react";
import {
  Image,
  Text,
  View,
} from "react-native";

import { ViewerPost } from "../../types/post";

import { userInfoStyles } from "../../styles/feed/userInfo.styles";

type UserInfoProps = {
  post: ViewerPost;
};

export default function UserInfo({
  post,
}: UserInfoProps) {
  const username =
    post.users?.creator_username ??
    post.users?.username ??
    "unknown";

  const avatar =
    post.users?.avatar_url ??
    post.users?.profile_picture ??
    post.users?.image ??
    null;

  const verified =
    Boolean(
      post.users?.is_verified ??
      post.users?.verified
    );

  return (
    <View style={userInfoStyles.container}>
      <View style={userInfoStyles.header}>
        {avatar ? (
          <Image
            source={{
              uri: avatar,
            }}
            style={userInfoStyles.avatar}
          />
        ) : (
          <View
            style={userInfoStyles.avatarPlaceholder}
          >
            <Text
              style={
                userInfoStyles.avatarLetter
              }
            >
              {username
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <View style={userInfoStyles.userSection}>
          <View
            style={
              userInfoStyles.usernameRow
            }
          >
            <Text
              style={
                userInfoStyles.username
              }
            >
              @{username}
            </Text>

            {verified && (
              <View
                style={
                  userInfoStyles.badge
                }
              >
                <Text
                  style={
                    userInfoStyles.badgeText
                  }
                >
                  ✓
                </Text>
              </View>
            )}
          </View>

          {!!post.caption && (
            <Text
              style={
                userInfoStyles.caption
              }
            >
              {post.caption}
            </Text>
          )}

          {!!post.topic && (
            <Text
              style={
                userInfoStyles.topic
              }
            >
              #{post.topic}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}