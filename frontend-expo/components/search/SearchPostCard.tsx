import React from "react";
import { Pressable, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import { searchPostCardStyles } from "../../styles/search/searchPostCard.styles";

export type SearchPost = {
  id: string;
  caption: string | null;
  topic: string | null;
  video_url: string | null;
  user_id: string;
};

type SearchPostCardProps = {
  post: SearchPost;
};

export default function SearchPostCard({
  post,
}: SearchPostCardProps) {
  const player = useVideoPlayer(
    post.video_url || null,
    (videoPlayer) => {
      videoPlayer.muted = true;
      videoPlayer.loop = true;
      videoPlayer.pause();
    }
  );

  const handlePress = () => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={searchPostCardStyles.container}
    >
      <View style={searchPostCardStyles.videoContainer}>
        {post.video_url ? (
          <VideoView
            player={player}
            style={searchPostCardStyles.video}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <View style={searchPostCardStyles.videoFallback}>
            <Text style={searchPostCardStyles.playIcon}>▶</Text>
          </View>
        )}
      </View>

      <View style={searchPostCardStyles.content}>
        <Text
          style={searchPostCardStyles.caption}
          numberOfLines={3}
        >
          {post.caption || post.topic || "Untitled post"}
        </Text>

        {post.topic ? (
          <Text
            style={searchPostCardStyles.topic}
            numberOfLines={1}
          >
            {post.topic}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}