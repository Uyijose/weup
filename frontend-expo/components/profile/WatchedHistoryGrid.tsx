import React from "react";

import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import HistoryVideoCard, {
  HistoryVideo,
} from "./HistoryVideoCard";

import { watchedHistoryGridStyles } from "../../styles/profile/watchedHistoryGrid.styles";

type Props = {
  videos: HistoryVideo[];
  isOwner: boolean;
  onViewAll?: () => void;
};

export default function WatchedHistoryGrid({
  videos,
  isOwner,
  onViewAll,
}: Props) {
  const openVideo = (video: HistoryVideo) => {
    const postId =
      video.parent_post_id ||
      video.post_id ||
      video.id;

    const isPartVideo =
      !!video.parent_post_id ||
      !!video.part_number ||
      !!video.video_part_id;

    const part =
      video.part_number ||
      video.part ||
      1;

    router.push({
      pathname: "/posts/[id]",
      params: {
        id: postId,
        feed: "watched",
        ...(isPartVideo
          ? { part: String(part) }
          : {}),
      },
    });
  };

  if (!videos.length) {
    return (
      <View
        style={
          watchedHistoryGridStyles.emptyContainer
        }
      >
        <Text
          style={
            watchedHistoryGridStyles.emptyTitle
          }
        >
          {isOwner
            ? "You haven't watched any videos yet."
            : "This user hasn't watched any videos yet."}
        </Text>

        {isOwner && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              watchedHistoryGridStyles.emptyButton
            }
            onPress={() =>
              router.push("/(tabs)")
            }
          >
            <Text
              style={
                watchedHistoryGridStyles.emptyButtonText
              }
            >
              Start Watching
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View>
      <View
        style={watchedHistoryGridStyles.grid}
      >
        {videos.map((video) => (
          <HistoryVideoCard
            key={video.id}
            video={video}
            onPress={openVideo}
          />
        ))}
      </View>

      {onViewAll && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={
            watchedHistoryGridStyles.viewAllButton
          }
          onPress={onViewAll}
        >
          <Text
            style={
              watchedHistoryGridStyles.viewAllText
            }
          >
            View All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}