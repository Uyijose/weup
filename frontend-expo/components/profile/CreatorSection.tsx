import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AvatarPicker from "./AvatarPicker";

type CreatorSectionProps = {
  creatorAvatarUrl: string | null;
  creatorUsername: string;
  platformTitle: string;
  creatorDescription: string;
  onCreatorAvatarChange: (uri: string) => void;
  onCreatorUsernameChange: (value: string) => void;
  onPlatformTitleChange: (value: string) => void;
  onCreatorDescriptionChange: (value: string) => void;
};

export default function CreatorSection({
  creatorAvatarUrl,
  creatorUsername,
  platformTitle,
  creatorDescription,
  onCreatorAvatarChange,
  onCreatorUsernameChange,
  onPlatformTitleChange,
  onCreatorDescriptionChange,
}: CreatorSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Creator Profile
      </Text>

      <AvatarPicker
        label="Creator Avatar"
        value={creatorAvatarUrl}
        onChange={onCreatorAvatarChange}
      />

      <View style={styles.field}>
        <Text style={styles.label}>
          Creator Username
        </Text>

        <TextInput
          value={creatorUsername}
          onChangeText={onCreatorUsernameChange}
          autoCapitalize="none"
          style={styles.input}
          placeholder="Creator username"
          placeholderTextColor="#777"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Platform Title
        </Text>

        <TextInput
          value={platformTitle}
          onChangeText={onPlatformTitleChange}
          style={styles.input}
          placeholder="Platform title"
          placeholderTextColor="#777"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Creator Description
        </Text>

        <TextInput
          value={creatorDescription}
          onChangeText={onCreatorDescriptionChange}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={[
            styles.input,
            styles.descriptionInput,
          ]}
          placeholder="Tell people about your creator profile"
          placeholderTextColor="#777"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#EDEDED",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: "#EDEDED",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#160B24",
    borderWidth: 1,
    borderColor: "#332044",
    borderRadius: 10,
    color: "#EDEDED",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  descriptionInput: {
    minHeight: 120,
  },
});