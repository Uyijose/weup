import {
  useState,
} from "react";

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  useRouter,
} from "expo-router";

import AppHeader from "../../components/layout/AppHeader";
import CaptionInput from "../../components/upload/CaptionInput";
import TopicSelector from "../../components/upload/TopicSelector";
import UploadProgress from "../../components/upload/UploadProgress";
import VideoPicker from "../../components/upload/VideoPicker";
import VideoPreview from "../../components/upload/VideoPreview";

import { SelectedVideo } from "../../hooks/useSelectFile";

import { useUploadVideoStore } from "../../stores/uploadVideoStore";

import { uploadStyles } from "../../styles/upload/upload.styles";

export default function UploadTab() {
  const router = useRouter();

  const [
    selectedVideo,
    setSelectedVideo,
  ] =
    useState<SelectedVideo | null>(null);

  const [
    selectedTopics,
    setSelectedTopics,
  ] =
    useState<string[]>([]);

  const caption =
    useUploadVideoStore(
      (state) => state.caption
    );

  const setTopic =
    useUploadVideoStore(
      (state) => state.setTopic
    );

  const setSelectedFile =
    useUploadVideoStore(
      (state) => state.setSelectedFile
    );

  const loading =
    useUploadVideoStore(
      (state) => state.loading
    );

  const uploadError =
    useUploadVideoStore(
      (state) => state.uploadError
    );

  const handleVideoSelected = (
    video: SelectedVideo
  ) => {
    console.log(
      "[UPLOAD SCREEN] Video selected:",
      video
    );

    setSelectedVideo(video);

    setSelectedFile({
      file: {
        uri: video.uri,
        name:
          video.fileName ||
          `video-${Date.now()}.mp4`,
        type: "video/mp4",
        size:
          video.fileSize || 0,
      },
    });

    console.log(
      "[UPLOAD SCREEN] Video metadata:",
      {
        fileName: video.fileName,
        duration: video.duration,
        fileSize: video.fileSize,
      }
    );
  };

  const handleRemoveVideo = () => {
    console.log(
      "[UPLOAD SCREEN] Removing selected video"
    );

    setSelectedVideo(null);
    setSelectedFile(null);
  };

  const handleTopicsChange = (
    topics: string[]
  ) => {
    console.log(
      "[UPLOAD SCREEN] Topics changed:",
      topics
    );

    setSelectedTopics(topics);

    const topicsToSave =
      topics.join(" ");

    setTopic(topicsToSave);
  };

  const validateUpload = () => {
    const trimmedCaption =
      caption.trim();

    console.log(
      "[UPLOAD VALIDATION] Starting validation"
    );

    if (
      trimmedCaption.length < 3
    ) {
      console.error(
        "[UPLOAD VALIDATION] Invalid caption"
      );

      return {
        valid: false,
        message:
          "Caption must be at least 3 characters",
      };
    }

    if (!selectedVideo) {
      console.error(
        "[UPLOAD VALIDATION] No video"
      );

      return {
        valid: false,
        message:
          "Please upload a video",
      };
    }

    if (
      selectedTopics.length === 0
    ) {
      console.error(
        "[UPLOAD VALIDATION] No topic"
      );

      return {
        valid: false,
        message:
          "Please select a topic",
      };
    }

    const hasEmptyCustomTopic =
      selectedTopics.some(
        (topic) =>
          !topic ||
          topic.trim().length === 0
      );

    if (hasEmptyCustomTopic) {
      console.error(
        "[UPLOAD VALIDATION] Invalid custom topic"
      );

      return {
        valid: false,
        message:
          "Please enter a custom topic",
      };
    }

    console.log(
      "[UPLOAD VALIDATION] Validation passed"
    );

    return {
      valid: true,
      message: "",
    };
  };

  const handlePost = async () => {
    if (loading) {
      console.log(
        "[UPLOAD] Post blocked because upload is running"
      );

      return;
    }

    const validation =
      validateUpload();

    if (!validation.valid) {
      Alert.alert(
        "Upload Error",
        validation.message
      );

      return;
    }

    setTopic(
      selectedTopics.join(" ")
    );

    console.log(
      "[UPLOAD] Starting post"
    );

    const result =
      await useUploadVideoStore
        .getState()
        .handlePost();

    if (!result.success) {
      console.error(
        "[UPLOAD] Upload failed"
      );

      return;
    }

    if (!result.postId) {
      Alert.alert(
        "Upload Error",
        "Post was uploaded but no post ID was returned."
      );

      return;
    }

    console.log(
      "[UPLOAD] Upload completed:",
      result.postId
    );

    useUploadVideoStore
      .getState()
      .resetUpload();

    setSelectedVideo(null);
    setSelectedTopics([]);

    console.log(
      "[UPLOAD] Navigating to post:",
      result.postId
    );

    if (result.hasParts) {
      router.push({
        pathname: "/posts/[id]",
        params: {
          id: result.postId,
          part: "1",
        },
      });

      return;
    }

    router.push({
      pathname: "/posts/[id]",
      params: {
        id: result.postId,
      },
    });
  };

  const handleCancel = () => {
    if (loading) {
      Alert.alert(
        "Upload in progress",
        "Please wait for the upload to finish."
      );

      return;
    }

    console.log(
      "[UPLOAD] Cancelling upload"
    );

    useUploadVideoStore
      .getState()
      .resetUpload();

    setSelectedVideo(null);
    setSelectedTopics([]);

    console.log(
      "[UPLOAD] Navigating away from upload"
    );

    router.replace("/");
  };

  return (
    <SafeAreaView
      style={uploadStyles.safeArea}
    >
      <View
        style={uploadStyles.container}
      >
        <AppHeader />

        <ScrollView
          contentContainerStyle={
            uploadStyles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={uploadStyles.title}
          >
            Upload Video
          </Text>

          <Text
            style={uploadStyles.subtitle}
          >
            Select a video from your device to
            get started.
          </Text>

          {!selectedVideo && (
            <View
              style={
                uploadStyles.pickerContainer
              }
            >
              <VideoPicker
                onVideoSelected={
                  handleVideoSelected
                }
              />
            </View>
          )}

          {selectedVideo && (
            <VideoPreview
              uri={selectedVideo.uri}
              onRemove={
                handleRemoveVideo
              }
            />
          )}

          {selectedVideo && (
            <View
              style={{
                marginTop: 16,
              }}
            >
              {selectedVideo.fileName && (
                <Text
                  style={
                    uploadStyles.selectedVideoText
                  }
                >
                  File:{" "}
                  {selectedVideo.fileName}
                </Text>
              )}

              {selectedVideo.duration !==
                null && (
                <Text
                  style={
                    uploadStyles.selectedVideoText
                  }
                >
                  Duration:{" "}
                  {Math.round(
                    selectedVideo.duration
                  )}{" "}
                  seconds
                </Text>
              )}

              {selectedVideo.fileSize !==
                null && (
                <Text
                  style={
                    uploadStyles.selectedVideoText
                  }
                >
                  Size:{" "}
                  {(
                    selectedVideo.fileSize /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB
                </Text>
              )}
            </View>
          )}

          <CaptionInput />

          <TopicSelector
            selectedTopics={
              selectedTopics
            }
            onTopicsChange={
              handleTopicsChange
            }
          />

          <UploadProgress />

          {uploadError !== "" &&
            !loading && (
              <Text
                style={{
                  color: "#FF4D4D",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                {uploadError}
              </Text>
            )}

          {!loading && (
            <Pressable
              onPress={handlePost}
              style={{
                marginTop: 20,
                backgroundColor:
                  "#6A00F4",
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Post
              </Text>
            </Pressable>
          )}

          {!loading && (
            <Pressable
              onPress={handleCancel}
              style={{
                marginTop: 12,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#AAAAAA",
                  fontSize: 15,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}