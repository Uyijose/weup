import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import useSelectFile, {
  SelectedVideo,
} from "../../hooks/useSelectFile";
import { videoPickerStyles } from "../../styles/upload/videoPicker.styles";

type VideoPickerProps = {
  onVideoSelected: (video: SelectedVideo) => void;
};

export default function VideoPicker({
  onVideoSelected,
}: VideoPickerProps) {
  const {
    selectedFile,
    onSelectedFile,
    clearSelectedFile,
    isPicking,
    error,
  } = useSelectFile();

  const handleSelectVideo = async () => {
    console.log("[VIDEO PICKER COMPONENT] Select Video pressed");

    await onSelectedFile();
  };

  const handleUseVideo = () => {
    if (!selectedFile) {
      console.log("[VIDEO PICKER COMPONENT] No video available");
      return;
    }

    console.log(
      "[VIDEO PICKER COMPONENT] Sending selected video to upload screen:",
      selectedFile
    );

    onVideoSelected(selectedFile);
  };

  const handleClearVideo = () => {
    console.log("[VIDEO PICKER COMPONENT] Removing selected video");
    clearSelectedFile();
  };

  return (
    <View style={videoPickerStyles.container}>
      <TouchableOpacity
        style={[
          videoPickerStyles.button,
          isPicking && videoPickerStyles.buttonDisabled,
        ]}
        onPress={handleSelectVideo}
        disabled={isPicking}
      >
        {isPicking ? (
          <View style={videoPickerStyles.buttonContent}>
            <ActivityIndicator />
            <Text style={videoPickerStyles.buttonText}>
              Selecting video...
            </Text>
          </View>
        ) : (
          <Text style={videoPickerStyles.buttonText}>
            Select Video
          </Text>
        )}
      </TouchableOpacity>

      {selectedFile && (
        <View style={videoPickerStyles.selectedInfo}>
          <Text style={videoPickerStyles.selectedTitle}>
            Video selected
          </Text>

          {selectedFile.fileName && (
            <Text style={videoPickerStyles.selectedText}>
              {selectedFile.fileName}
            </Text>
          )}

          {selectedFile.duration !== null && (
            <Text style={videoPickerStyles.selectedText}>
              Duration: {Math.round(selectedFile.duration)} seconds
            </Text>
          )}

          {selectedFile.fileSize !== null && (
            <Text style={videoPickerStyles.selectedText}>
              Size:{" "}
              {(selectedFile.fileSize / (1024 * 1024)).toFixed(2)} MB
            </Text>
          )}

          <View style={videoPickerStyles.actions}>
            <TouchableOpacity
              style={videoPickerStyles.useButton}
              onPress={handleUseVideo}
            >
              <Text style={videoPickerStyles.useButtonText}>
                Use This Video
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={videoPickerStyles.removeButton}
              onPress={handleClearVideo}
            >
              <Text style={videoPickerStyles.removeButtonText}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error && (
        <Text style={videoPickerStyles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}