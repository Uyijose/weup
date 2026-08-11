import {
  Text,
  View,
} from "react-native";

import { useUploadVideoStore } from "../../stores/uploadVideoStore";
import { uploadProgressStyles } from "../../styles/upload/uploadProgress.styles";

export default function UploadProgress() {
  const loading = useUploadVideoStore(
    (state) => state.loading
  );

  const uploadProgress =
    useUploadVideoStore(
      (state) => state.uploadProgress
    );

  const uploadMessage =
    useUploadVideoStore(
      (state) => state.uploadMessage
    );

  if (!loading) {
    return null;
  }

  const percentage = Math.min(
    Math.max(uploadProgress, 0),
    100
  );

  return (
    <View
      style={
        uploadProgressStyles.container
      }
    >
      <Text
        style={
          uploadProgressStyles.message
        }
      >
        {uploadMessage ||
          "Uploading video..."}
      </Text>

      <View
        style={
          uploadProgressStyles.track
        }
      >
        <View
          style={[
            uploadProgressStyles.fill,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>

      <Text
        style={
          uploadProgressStyles.percentage
        }
      >
        {percentage}%
      </Text>
    </View>
  );
}