import React from "react";

import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { watchedHistoryGridStyles } from "../../styles/profile/watchedHistoryGrid.styles";

type Video = {
  id: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  caption?: string | null;
  post_id?: string | null;
  parent_post_id?: string | null;
  video_part_id?: string | null;
  part_number?: number | null;
  part?: number | null;
};

type Props = {
  videos: Video[];
  isOwner: boolean;
};

export default function WatchedHistoryGrid({
  videos,
  isOwner,
}: Props) {
  const openVideo = (video: Video) => {
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
        ...(isPartVideo ? { part: String(part) } : {}),
      },
    });
  };

  if (!videos.length) {
    return (
      <View style={watchedHistoryGridStyles.emptyContainer}>
        <Text style={watchedHistoryGridStyles.emptyTitle}>
          {isOwner
            ? "You haven't watched any videos yet."
            : "This user hasn't watched any videos yet."}
        </Text>

        {isOwner && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={watchedHistoryGridStyles.emptyButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text
              style={watchedHistoryGridStyles.emptyButtonText}
            >
              Start Watching
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={watchedHistoryGridStyles.grid}>
      {videos.map((video) => {
        const caption =
          video.caption?.trim() ||
          "No caption";

        return (
          <TouchableOpacity
            key={video.id}
            activeOpacity={0.85}
            style={watchedHistoryGridStyles.card}
            onPress={() => openVideo(video)}
          >
            <View
              style={watchedHistoryGridStyles.thumbnailWrapper}
            >
              {video.thumbnail_url ? (
                <Image
                  source={{
                    uri: video.thumbnail_url,
                  }}
                  style={
                    watchedHistoryGridStyles.thumbnail
                  }
                />
              ) : (
                <View
                  style={
                    watchedHistoryGridStyles.videoPlaceholder
                  }
                >
                  <Text
                    style={
                      watchedHistoryGridStyles.playIcon
                    }
                  >
                    ▶
                  </Text>
                </View>
              )}

              <View
                style={
                  watchedHistoryGridStyles.playOverlay
                }
              >
                <Text
                  style={
                    watchedHistoryGridStyles.playText
                  }
                >
                  ▶
                </Text>
              </View>
            </View>

            <Text
              numberOfLines={2}
              style={watchedHistoryGridStyles.caption}
            >
              {caption}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}