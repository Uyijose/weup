import React, { useState } from "react";

import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { useMessagesStore } from "../../stores/messagesStore";

import { profileActionsStyles } from "../../styles/profile/profileActions.styles";

type User = {
  id: string;
  is_creator?: boolean | null;
  creator_username?: string | null;
};

type Props = {
  authUser: User | null;
  profileUser: User;
  isOwner: boolean;
  isAdmin: boolean;
};

export default function ProfileActions({
  authUser,
  profileUser,
  isOwner,
  isAdmin,
}: Props) {
  const [messageLoading, setMessageLoading] =
    useState(false);

  const createConversation =
    useMessagesStore(
      (state: any) => state.createConversation
    );

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleAdminPanel = () => {
    // router.push("/admin/dashboard");
  };

  const handleCreatorPage = () => {
    if (!profileUser.creator_username) {
      return;
    }

    router.push(
      `/creator/${profileUser.creator_username}`
    );
  };

  const handleSubscriptions = () => {
    router.push("/(tabs)/subscriptions");
  };

  const handleMessages = async () => {
    if (messageLoading) {
      return;
    }

    if (!authUser?.id) {
      router.push("/(auth)/signin");
      return;
    }

    if (isOwner) {
      router.push("/chat/new");
      return;
    }

    try {
      setMessageLoading(true);

      const response =
        await createConversation(
          [authUser.id, profileUser.id],
          false,
          null
        );

      const conversationId =
        response?.conversation?.id;

      if (!conversationId) {
        Alert.alert(
          "Unable to start conversation",
          "Please try again."
        );
        return;
      }

      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.log(
        "[PROFILE MESSAGE ERROR]",
        error
      );

      Alert.alert(
        "Message failed",
        "Unable to open this conversation."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <View style={profileActionsStyles.container}>
      {isOwner && (
        <>
          <TouchableOpacity
            style={profileActionsStyles.primaryButton}
            activeOpacity={0.8}
            onPress={handleEditProfile}
          >
            <Text
              style={profileActionsStyles.primaryButtonText}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={profileActionsStyles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleSubscriptions}
          >
            <Text
              style={profileActionsStyles.secondaryButtonText}
            >
              Subscriptions
            </Text>
          </TouchableOpacity>
        </>
      )}

      {isAdmin && (
        <TouchableOpacity
          style={profileActionsStyles.adminButton}
          activeOpacity={0.8}
          onPress={handleAdminPanel}
        >
          <Text
            style={profileActionsStyles.adminButtonText}
          >
            Admin Panel
          </Text>
        </TouchableOpacity>
      )}

      {authUser && (
        <TouchableOpacity
          style={profileActionsStyles.secondaryButton}
          activeOpacity={0.8}
          onPress={handleMessages}
          disabled={messageLoading}
        >
          <Text
            style={profileActionsStyles.secondaryButtonText}
          >
            {messageLoading
              ? "Opening..."
              : isOwner
                ? "Messages"
                : "Message"}
          </Text>
        </TouchableOpacity>
      )}

      {profileUser.is_creator &&
        profileUser.creator_username && (
          <TouchableOpacity
            style={profileActionsStyles.creatorButton}
            activeOpacity={0.8}
            onPress={handleCreatorPage}
          >
            <Text
              style={profileActionsStyles.creatorButtonText}
            >
              Creator Page
            </Text>
          </TouchableOpacity>
        )}
    </View>
  );
}