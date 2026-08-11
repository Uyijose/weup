import { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  View,
} from "react-native";

import { useUploadVideoStore } from "../../stores/uploadVideoStore";
import { captionInputStyles } from "../../styles/upload/captionInput.styles";

export default function CaptionInput() {
  const caption = useUploadVideoStore(
    (state) => state.caption
  );

  const setCaption = useUploadVideoStore(
    (state) => state.setCaption
  );

  const [touched, setTouched] = useState(false);

  const trimmedCaption = caption.trim();

  const error =
    touched && trimmedCaption.length < 3
      ? "Caption must be at least 3 characters"
      : "";

  useEffect(() => {
    if (caption.length > 0) {
      setTouched(true);
    }
  }, [caption]);

  return (
    <View style={captionInputStyles.container}>
      <Text style={captionInputStyles.label}>
        Caption
      </Text>

      <TextInput
        value={caption}
        onChangeText={setCaption}
        onBlur={() => setTouched(true)}
        placeholder="Write a caption..."
        placeholderTextColor="#888888"
        style={[
          captionInputStyles.input,
          error
            ? captionInputStyles.inputError
            : null,
        ]}
        maxLength={500}
        returnKeyType="done"
      />

      <View style={captionInputStyles.footer}>
        {error ? (
          <Text style={captionInputStyles.error}>
            {error}
          </Text>
        ) : (
          <Text style={captionInputStyles.hint}>
            Minimum 3 characters
          </Text>
        )}

        <Text style={captionInputStyles.counter}>
          {caption.length}/500
        </Text>
      </View>
    </View>
  );
}