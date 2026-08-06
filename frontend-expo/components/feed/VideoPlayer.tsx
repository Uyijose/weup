import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  VideoView,
  useVideoPlayer,
} from "expo-video";

import { ViewerPost } from "../../types/post";

import { videoPlayerStyles } from "../../styles/feed/videoPlayer.styles";

import { videoControlsStyles } from "../../styles/feed/videoControls.styles";


type VideoPlayerProps = {
  post: ViewerPost;
  isActive: boolean;
};


export default function VideoPlayer({
  post,
  isActive,
}: VideoPlayerProps) {

  const [muted, setMuted] = useState(false);

  const [playing, setPlaying] = useState(false);

  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(0);


  const player = useVideoPlayer(
    post.video_url,
    (player) => {
      player.loop = true;
      player.muted = false;
    }
  );


  useEffect(() => {

    const interval = setInterval(() => {

      if (!player.duration) {
        return;
      }

      setProgress(
        player.currentTime / player.duration
      );

    }, 500);


    return () => {
      clearInterval(interval);
    };

  }, [player]);


  useEffect(() => {

    if (isActive) {
      player.play();
      setPlaying(true);
    } 
    else {
      player.pause();
      setPlaying(false);
    }

  }, [isActive, player]);


  useEffect(() => {

    player.muted = muted;

  }, [muted, player]);


  useEffect(() => {

    const subscription =
      player.addListener(
        "statusChange",
        (status) => {

          if (
            status.status === "readyToPlay"
          ) {
            setLoading(false);
          }

        }
      );


    return () => {
      subscription.remove();
    };

  }, [player]);


  function togglePlay() {

    if (playing) {

      player.pause();

      setPlaying(false);

    } else {

      player.play();

      setPlaying(true);

    }

  }


  function toggleMute() {

    setMuted((value) => !value);

  }


  function seekForward() {

    if (!player.duration) {
      return;
    }

    player.currentTime =
      Math.min(
        player.currentTime + 5,
        player.duration
      );

  }


  if (!post.video_url) {

    return (
      <View
        style={
          videoPlayerStyles.container
        }
      />
    );

  }


  return (

    <View
      style={
        videoPlayerStyles.container
      }
    >

      <VideoView
        player={player}
        style={
          videoPlayerStyles.video
        }
        nativeControls={false}
        contentFit="cover"
      />


      {
        loading && (

          <ActivityIndicator
            size="large"
            style={
              videoControlsStyles.loading
            }
            color="#fff"
          />

        )
      }


      <Pressable
        onPress={togglePlay}
        style={
          videoControlsStyles.centerButton
        }
      >

        <Text
          style={
            videoControlsStyles.buttonText
          }
        >
          {
            playing
              ? "Ⅱ"
              : "▶"
          }
        </Text>

      </Pressable>


      <Pressable
        onPress={toggleMute}
        style={
          videoControlsStyles.muteButton
        }
      >

        <Text
          style={
            videoControlsStyles.buttonText
          }
        >
          {
            muted
              ? "🔇"
              : "🔊"
          }
        </Text>

      </Pressable>


      <Pressable
        onPress={seekForward}
        style={
          videoControlsStyles.controlsContainer
        }
      >

        <View
          style={
            videoControlsStyles.progressContainer
          }
        >

          <View
            style={[
              videoControlsStyles.progressBar,
              {
                width:
                  `${progress * 100}%`,
              },
            ]}
          />

        </View>

      </Pressable>


    </View>

  );
}