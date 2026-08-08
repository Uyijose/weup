import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import { supabase } from "../../lib/supabase";

import AvatarPicker from "./AvatarPicker";
import PasswordSection from "./PasswordSection";
import CreatorSection from "./CreatorSection";

type Profile = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  is_creator?: boolean | null;
  creator_username?: string | null;
  platform_title?: string | null;
  creator_description?: string | null;
  creator_avatar_url?: string | null;
};

type EditProfileFormProps = {
  userId: string;
};

export default function EditProfileForm({
  userId,
}: EditProfileFormProps) {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [username, setUsername] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const [creatorAvatarUrl, setCreatorAvatarUrl] =
    useState<string | null>(null);

  const [creatorUsername, setCreatorUsername] =
    useState("");

  const [platformTitle, setPlatformTitle] =
    useState("");

  const [creatorDescription, setCreatorDescription] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const loadProfile = async () => {
    if (!userId) {
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error,
      } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.log(
          "[EDIT PROFILE] Failed to load profile:",
          error
        );

        Alert.alert(
          "Error",
          "Failed to load your profile."
        );

        return;
      }

      const userProfile =
        data as Profile;

      setProfile(userProfile);

      setUsername(
        userProfile.username ?? ""
      );

      setFullName(
        userProfile.full_name ?? ""
      );

      setAvatarUrl(
        userProfile.avatar_url ?? null
      );

      setCreatorAvatarUrl(
        userProfile.creator_avatar_url ?? null
      );

      setCreatorUsername(
        userProfile.creator_username ?? ""
      );

      setPlatformTitle(
        userProfile.platform_title ?? ""
      );

      setCreatorDescription(
        userProfile.creator_description ?? ""
      );
    } catch (error) {
      console.log(
        "[EDIT PROFILE] Unexpected load error:",
        error
      );

      Alert.alert(
        "Error",
        "Failed to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleSave = async () => {
    if (!profile?.id || saving) {
      return;
    }

    if (!username.trim()) {
      Alert.alert(
        "Invalid Username",
        "Username is required."
      );
      return;
    }

    if (/\s/.test(username)) {
      Alert.alert(
        "Invalid Username",
        "Username cannot contain spaces."
      );
      return;
    }

    if (
      profile.is_creator &&
      /\s/.test(creatorUsername)
    ) {
      Alert.alert(
        "Invalid Creator Username",
        "Creator Username cannot contain spaces."
      );
      return;
    }

    if (newPassword) {
      if (
        newPassword !== confirmPassword
      ) {
        Alert.alert(
          "Password Error",
          "Passwords do not match."
        );
        return;
      }

      if (/\s/.test(newPassword)) {
        Alert.alert(
          "Password Error",
          "Password cannot contain spaces."
        );
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert(
          "Password Error",
          "Password must be at least 6 characters."
        );
        return;
      }
    }

    setSaving(true);

    try {
      if (newPassword) {
        const {
          error,
        } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          console.log(
            "[EDIT PROFILE] Password update failed:",
            error
          );

          const message =
            error.message?.toLowerCase() ?? "";

          if (
            message.includes(
              "different from the old password"
            )
          ) {
            Alert.alert(
              "Password Error",
              "Your new password must be different from your current password."
            );
          } else {
            Alert.alert(
              "Password Error",
              "Password update failed. Please try again."
            );
          }

          return;
        }
      }

      const updateData: Record<
        string,
        any
      > = {
        username: username.trim(),
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      if (profile.is_creator) {
        updateData.creator_username =
          creatorUsername.trim();

        updateData.platform_title =
          platformTitle.trim();

        updateData.creator_description =
          creatorDescription.trim();

        updateData.creator_avatar_url =
          creatorAvatarUrl;
      }

      const {
        error,
      } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", profile.id);

      if (error) {
        console.log(
          "[EDIT PROFILE] Profile update failed:",
          error
        );

        if (
          error.code === "23505" ||
          error.message
            ?.toLowerCase()
            .includes("username")
        ) {
          Alert.alert(
            "Username Taken",
            "This username is already taken. Please choose another."
          );
        } else {
          Alert.alert(
            "Update Failed",
            "Failed to update your profile. Please try again."
          );
        }

        return;
      }

      setNewPassword("");
      setConfirmPassword("");

      Alert.alert(
        "Success",
        "Your profile has been updated.",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        "[EDIT PROFILE] Save error:",
        error
      );

      Alert.alert(
        "Error",
        "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color="#6A00F4"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Unable to load profile.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        User Profile
      </Text>

      <AvatarPicker
        label="Profile Avatar"
        value={avatarUrl}
        onChange={setAvatarUrl}
      />

      <View style={styles.field}>
        <Text style={styles.label}>
          Username
        </Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#777"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Full Name
        </Text>

        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#777"
        />
      </View>

      {profile.is_creator === true && (
        <CreatorSection
          creatorAvatarUrl={
            creatorAvatarUrl
          }
          creatorUsername={
            creatorUsername
          }
          platformTitle={
            platformTitle
          }
          creatorDescription={
            creatorDescription
          }
          onCreatorAvatarChange={
            setCreatorAvatarUrl
          }
          onCreatorUsernameChange={
            setCreatorUsername
          }
          onPlatformTitleChange={
            setPlatformTitle
          }
          onCreatorDescriptionChange={
            setCreatorDescription
          }
        />
      )}

      <PasswordSection
        newPassword={newPassword}
        confirmPassword={
          confirmPassword
        }
        showNewPassword={
          showNewPassword
        }
        showConfirmPassword={
          showConfirmPassword
        }
        setNewPassword={
          setNewPassword
        }
        setConfirmPassword={
          setConfirmPassword
        }
        setShowNewPassword={
          setShowNewPassword
        }
        setShowConfirmPassword={
          setShowConfirmPassword
        }
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.saveButton,
          saving &&
            styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <Text style={styles.saveText}>
            Save Changes
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 40,
  },
  loadingContainer: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#999",
    fontSize: 14,
    marginTop: 10,
  },
  errorContainer: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#EDEDED",
    fontSize: 15,
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
  saveButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: "#6A00F4",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});