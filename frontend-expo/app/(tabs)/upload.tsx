import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import AppHeader from "../../components/layout/AppHeader";
import VideoPicker from "../../components/upload/VideoPicker";
import { SelectedVideo } from "../../hooks/useSelectFile";
import { uploadStyles } from "../../styles/upload/upload.styles";

export default function UploadTab() {
  console.log("[UPLOAD SCREEN] UploadTab rendered");

  const [selectedVideo, setSelectedVideo] =
    useState<SelectedVideo | null>(null);

  const handleVideoSelected = (video: SelectedVideo) => {
    console.log("[UPLOAD SCREEN] Video received:", video);

    setSelectedVideo(video);

    Alert.alert(
      "Video Selected",
      video.fileName
        ? `${video.fileName} has been selected.`
        : "Video has been selected."
    );
  };

  return (
    <SafeAreaView style={uploadStyles.safeArea}>
      <View style={uploadStyles.container}>
        <AppHeader />

        <ScrollView
          contentContainerStyle={uploadStyles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={uploadStyles.title}>
            Upload Video
          </Text>

          <Text style={uploadStyles.subtitle}>
            Select a video from your device to get started.
          </Text>

          <View style={uploadStyles.pickerContainer}>
            <VideoPicker
              onVideoSelected={handleVideoSelected}
            />
          </View>

          {selectedVideo && (
            <View>
              <Text style={uploadStyles.selectedVideoText}>
                Selected video URI:
              </Text>

              <Text style={uploadStyles.selectedVideoText}>
                {selectedVideo.uri}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}