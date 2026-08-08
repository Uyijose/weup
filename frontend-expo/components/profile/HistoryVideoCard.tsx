import React from "react";

import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { historyVideoCardStyles } from "../../styles/profile/historyVideoCard.styles";

export type HistoryVideo = {
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
  video: HistoryVideo;
  onPress: (video: HistoryVideo) => void;
};

export default function HistoryVideoCard({
  video,
  onPress,
}: Props) {
  const caption =
    video.caption?.trim() || "No caption";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={historyVideoCardStyles.card}
      onPress={() => onPress(video)}
    >
      <View
        style={
          historyVideoCardStyles.thumbnailWrapper
        }
      >
        {video.thumbnail_url ? (
          <Image
            source={{
              uri: video.thumbnail_url,
            }}
            style={historyVideoCardStyles.thumbnail}
          />
        ) : (
          <View
            style={
              historyVideoCardStyles.videoPlaceholder
            }
          >
            <Text
              style={historyVideoCardStyles.playIcon}
            >
              ▶
            </Text>
          </View>
        )}

        <View
          style={
            historyVideoCardStyles.playOverlay
          }
        >
          <Text
            style={historyVideoCardStyles.playText}
          >
            ▶
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={historyVideoCardStyles.caption}
      >
        {caption}
      </Text>
    </TouchableOpacity>
  );
}