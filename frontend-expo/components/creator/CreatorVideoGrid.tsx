import React from "react";

import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CreatorVideoCard, {
  CreatorVideo,
} from "./CreatorVideoCard";

import { creatorVideoGridStyles } from "../../styles/creator/creatorVideoGrid.styles";

type Props = {
  videos: CreatorVideo[];
  loading: boolean;
  canDelete: boolean;
  showAll: boolean;
  onViewAll: () => void;
  onDelete: (videoId: string) => Promise<void>;
};

export default function CreatorVideoGrid({
  videos,
  loading,
  canDelete,
  showAll,
  onViewAll,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <View style={creatorVideoGridStyles.loader}>
        <ActivityIndicator
          size="small"
          color="#6A00F4"
        />

        <Text style={creatorVideoGridStyles.loaderText}>
          Loading videos...
        </Text>
      </View>
    );
  }

  if (!videos.length) {
    return (
      <View style={creatorVideoGridStyles.empty}>
        <Text style={creatorVideoGridStyles.emptyText}>
          No videos uploaded yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={creatorVideoGridStyles.container}>
      <View style={creatorVideoGridStyles.grid}>
        {videos.map((video) => (
          <CreatorVideoCard
            key={video.id}
            video={video}
            canDelete={canDelete}
            onDelete={onDelete}
          />
        ))}
      </View>

      {showAll && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={creatorVideoGridStyles.viewAllButton}
          onPress={onViewAll}
        >
          <Text style={creatorVideoGridStyles.viewAllText}>
            View All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}