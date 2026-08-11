import React, { useEffect } from "react";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import {
  VideoView,
  useVideoPlayer,
} from "expo-video";

import { videoPreviewStyles } from "../../styles/upload/videoPreview.styles";

type VideoPreviewProps = {
  uri: string;
  onRemove: () => void;
};

export default function VideoPreview({
  uri,
  onRemove,
}: VideoPreviewProps) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    player.play();
  }, [player]);

  return (
    <View style={videoPreviewStyles.container}>
      <VideoView
        player={player}
        style={videoPreviewStyles.video}
        nativeControls={true}
        contentFit="contain"
      />

      <Pressable
        onPress={onRemove}
        style={videoPreviewStyles.removeButton}
      >
        <Text style={videoPreviewStyles.removeButtonText}>
          Remove Video
        </Text>
      </Pressable>
    </View>
  );
}