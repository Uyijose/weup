import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export type SelectedVideo = {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  duration: number | null;
  width: number | null;
  height: number | null;
};

const useSelectFile = () => {
  const [selectedFile, setSelectedFile] = useState<SelectedVideo | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSelectedFile = async () => {
    console.log("[VIDEO PICKER] Opening media library");

    setIsPicking(true);
    setError(null);

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      console.log("[VIDEO PICKER] Permission result:", permissionResult);

      if (!permissionResult.granted) {
        console.log("[VIDEO PICKER] Permission denied");

        setError("Permission to access your videos is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: false,
        allowsMultipleSelection: false,
      });

      console.log("[VIDEO PICKER] Picker result:", result);

      if (result.canceled) {
        console.log("[VIDEO PICKER] User cancelled video selection");
        return;
      }

      const asset = result.assets?.[0];

      if (!asset) {
        console.log("[VIDEO PICKER] No asset returned");
        setError("No video was selected.");
        return;
      }

      if (asset.type !== "video") {
        console.log("[VIDEO PICKER] Selected asset is not a video");
        setError("Please select a video.");
        return;
      }

      const video = {
        uri: asset.uri,
        fileName: asset.fileName ?? null,
        mimeType: asset.mimeType ?? null,
        fileSize: asset.fileSize ?? null,
        duration: asset.duration ?? null,
        width: asset.width ?? null,
        height: asset.height ?? null,
      };

      console.log("[VIDEO PICKER] Video selected:", video);

      setSelectedFile(video);
    } catch (pickerError) {
      console.log("[VIDEO PICKER] Error:", pickerError);

      setError("Unable to select video. Please try again.");
    } finally {
      setIsPicking(false);
      console.log("[VIDEO PICKER] Selection process finished");
    }
  };

  const clearSelectedFile = () => {
    console.log("[VIDEO PICKER] Clearing selected video");
    setSelectedFile(null);
    setError(null);
  };

  return {
    selectedFile,
    setSelectedFile,
    onSelectedFile,
    clearSelectedFile,
    isPicking,
    error,
  };
};

export default useSelectFile;