i clikced on the uploads tab and it is showing just uploads on the screen; 

frontend-expo\app\(tabs)\upload.tsx:
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

frontend-expo\hooks\useSelectFile.ts:
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

frontend-expo\components\upload\VideoPicker.tsx:
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

frontend-expo\app\(tabs)\_layout.tsx:
import { Tabs } from "expo-router";

import TabIcon from "../../components/navigation/TabIcon";
import { Colors } from "../../styles/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="compass"
              title="Explore"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="posts"
        options={{
          title: "Posts",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="film"
              title="Posts"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="add-circle"
              title="Upload"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Subscriptions",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="star"
              title="Subscriptions"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="person"
              title="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}

frontend-expo\app\(tabs)\index.tsx:
import { SafeAreaView } from "react-native";

import AppHeader from "../../components/layout/AppHeader";
import ExploreHeader from "../../components/feed/ExploreHeader";
import TopicChips from "../../components/feed/TopicChips";
import ExploreFeed from "../../components/feed/ExploreFeed";

export default function ExploreTab() {
  console.log("[SCREEN] Explore mounted");

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#000",
      }}
    >
      <AppHeader />

      <ExploreHeader />

      <TopicChips />

      <ExploreFeed />
    </SafeAreaView>
  );
}


all stles used here are present i didnt send them to avoid too much long texts
and  i restart the expo and cleared the caache


you can use profile as a guide

frontend-expo\app\(tabs)\profile.tsx:
import React, { useEffect } from "react";

import { ActivityIndicator, SafeAreaView } from "react-native";

import { router } from "expo-router";

import { useAuthStore } from "../../stores/authStore";

export default function ProfileTab() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user?.id) {
      router.replace("/(auth)/signin");
      return;
    }

    router.replace({
      pathname: "/user/[id]",
      params: {
        id: String(user.id),
      },
    });
  }, [loading, user?.id]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator
        size="large"
        color="#6A00F4"
      />
    </SafeAreaView>
  );
}

frontend-expo\app\user\[id].tsx:
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useAuthStore } from "../../stores/authStore";
import { useUsersStore } from "../../stores/usersStore";
import { useWatchedHistoryStore } from "../../stores/watchedHistoryStore";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileStats from "../../components/profile/ProfileStats";
import ProfileActions from "../../components/profile/ProfileActions";
import WatchedHistoryGrid from "../../components/profile/WatchedHistoryGrid";

import { userProfileStyles } from "../../styles/profile/userProfile.styles";

const PAGE_SIZE = 16;

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const authUser = useAuthStore(
    (state) => state.user
  );

  const authLoading = useAuthStore(
    (state) => state.loading
  );

  const hydrateAuth = useAuthStore(
    (state) => state.hydrateAuth
  );

  const profileUser = useUsersStore(
    (state: any) =>
      id ? state.usersMap[id] : null
  );

  const usersLoading = useUsersStore(
    (state: any) => state.loading
  );

  const fetchUserById = useUsersStore(
    (state: any) => state.fetchUserById
  );

  const watchedVideos = useWatchedHistoryStore(
    (state: any) => state.watchedVideos
  );

  const watchedLoading = useWatchedHistoryStore(
    (state: any) => state.loading
  );

  const fetchWatchedHistory =
    useWatchedHistoryStore(
      (state: any) =>
        state.fetchWatchedHistory
    );

  const [refreshing, setRefreshing] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const isOwner = useMemo(() => {
    if (!authUser?.id || !profileUser?.id) {
      return false;
    }

    return (
      String(authUser.id) ===
      String(profileUser.id)
    );
  }, [authUser?.id, profileUser?.id]);

  const isAdmin =
    authUser?.is_admin === true;

  const totalPages = Math.max(
    1,
    Math.ceil(
      watchedVideos.length / PAGE_SIZE
    )
  );

  const pageVideos = useMemo(() => {
    const start =
      (currentPage - 1) * PAGE_SIZE;

    const end =
      start + PAGE_SIZE;

    return watchedVideos.slice(
      start,
      end
    );
  }, [
    currentPage,
    watchedVideos,
  ]);

  const loadProfile = useCallback(
    async () => {
      if (!id) {
        return;
      }

      await fetchUserById(id, true);
      await fetchWatchedHistory(id);
    },
    [
      id,
      fetchUserById,
      fetchWatchedHistory,
    ]
  );

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (!id) {
      return;
    }

    setCurrentPage(1);

    loadProfile();
  }, [id, loadProfile]);

  const handleRefresh = async () => {
    if (!id) {
      return;
    }

    try {
      setRefreshing(true);

      await loadProfile();

      setCurrentPage(1);
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView
        style={userProfileStyles.center}
      >
        <ActivityIndicator
          size="large"
          color="#6A00F4"
        />
      </SafeAreaView>
    );
  }

  if (!id) {
    return (
      <SafeAreaView
        style={userProfileStyles.center}
      >
        <Text
          style={userProfileStyles.errorTitle}
        >
          Invalid profile
        </Text>

        <Text
          style={userProfileStyles.errorText}
        >
          We couldn't determine which profile
          to display.
        </Text>
      </SafeAreaView>
    );
  }

  if (usersLoading && !profileUser) {
    return (
      <SafeAreaView
        style={userProfileStyles.center}
      >
        <ActivityIndicator
          size="large"
          color="#6A00F4"
        />

        <Text
          style={userProfileStyles.loadingText}
        >
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView
        style={userProfileStyles.center}
      >
        <Text
          style={userProfileStyles.errorTitle}
        >
          Profile not found
        </Text>

        <Text
          style={userProfileStyles.errorText}
        >
          This profile may no longer exist.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView


if you want to fix it pls, first of all state what causes the problem, then state the code file path to be edited the old code to be replaced and then new code to replace it, the code to be deleted, and if a new code is to be added state exactly where it should be added that is the line before or after where it should be added. so i don't get confused.. and lastly dont add comments