import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

type AvatarPickerProps = {
  label: string;
  value: string | null;
  onChange: (uri: string) => void;
};

export default function AvatarPicker({
  label,
  value,
  onChange,
}: AvatarPickerProps) {
  const handlePickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    onChange(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.picker}
        onPress={handlePickImage}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              +
            </Text>
          </View>
        )}

        <Text style={styles.changeText}>
          {value ? "Change Photo" : "Choose Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    color: "#EDEDED",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  picker: {
    alignItems: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  placeholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#241238",
    borderWidth: 1,
    borderColor: "#6A00F4",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#EDEDED",
    fontSize: 42,
    fontWeight: "300",
  },
  changeText: {
    color: "#00D2FF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
  },
});