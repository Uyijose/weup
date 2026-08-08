import React from "react";

import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { creatorVideoCardStyles } from "../../styles/creator/creatorVideoCard.styles";

export type CreatorVideo = {
  id: string;
  user_id?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  caption?: string | null;
  views_count?: number | null;
  created_at?: string | null;
};

type Props = {
  video: CreatorVideo;
  canDelete: boolean;
  onDelete: (videoId: string) => Promise<void>;
};

export default function CreatorVideoCard({
  video,
  canDelete,
  onDelete,
}: Props) {
  const handleOpen = () => {
    router.push({
      pathname: "/posts/[id]",
      params: {
        id: video.id,
      },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete video",
      "Are you sure you want to delete this video?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await onDelete(video.id);
          },
        },
      ]
    );
  };

  return (
    <View style={creatorVideoCardStyles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleOpen}
      >
        <View style={creatorVideoCardStyles.thumbnailWrapper}>
          {video.thumbnail_url ? (
            <Image
              source={{
                uri: video.thumbnail_url,
              }}
              style={creatorVideoCardStyles.thumbnail}
            />
          ) : (
            <View style={creatorVideoCardStyles.placeholder}>
              <Text style={creatorVideoCardStyles.playIcon}>
                ▶
              </Text>
            </View>
          )}

          <View style={creatorVideoCardStyles.playOverlay}>
            <Text style={creatorVideoCardStyles.playText}>
              ▶
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={2}
          style={creatorVideoCardStyles.caption}
        >
          {video.caption?.trim() || "No caption"}
        </Text>

        {typeof video.views_count === "number" && (
          <Text style={creatorVideoCardStyles.views}>
            {video.views_count}{" "}
            {video.views_count === 1 ? "view" : "views"}
          </Text>
        )}
      </TouchableOpacity>

      {canDelete && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={creatorVideoCardStyles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={creatorVideoCardStyles.deleteText}>
            Delete
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}