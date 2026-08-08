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
      style={userProfileStyles.safeArea}
    >
      <ScrollView
        style={userProfileStyles.container}
        contentContainerStyle={
          userProfileStyles.content
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6A00F4"
          />
        }
      >
        <ProfileHeader
          user={profileUser}
          isOwner={isOwner}
          isAdmin={isAdmin}
        />

        <ProfileStats
          watchedCount={
            watchedVideos.length
          }
          subscriptionsCount={
            isOwner
              ? profileUser.subscriptions_count ??
                0
              : 0
          }
          onSubscriptionsPress={() => {
            if (isOwner) {
              router.push(
                "/(tabs)/subscriptions"
              );
            }
          }}
        />

        <ProfileActions
          authUser={authUser}
          profileUser={profileUser}
          isOwner={isOwner}
          isAdmin={isAdmin}
        />

        <View
          style={userProfileStyles.sectionHeader}
        >
          <Text
            style={userProfileStyles.sectionTitle}
          >
            Watched History
          </Text>

          {watchedVideos.length > 0 && (
            <Text
              style={userProfileStyles.sectionCount}
            >
              {watchedVideos.length}{" "}
              {watchedVideos.length === 1
                ? "video"
                : "videos"}
            </Text>
          )}
        </View>

        {watchedLoading &&
        watchedVideos.length === 0 ? (
          <View
            style={
              userProfileStyles.historyLoader
            }
          >
            <ActivityIndicator
              size="small"
              color="#6A00F4"
            />

            <Text
              style={
                userProfileStyles.loadingText
              }
            >
              Loading watched history...
            </Text>
          </View>
        ) : (
          <WatchedHistoryGrid
            videos={pageVideos}
            isOwner={isOwner}
          />
        )}

        {totalPages > 1 && (
          <View
            style={
              userProfileStyles.pagination
            }
          >
            <Text
              style={
                userProfileStyles.pageIndicator
              }
            >
              Page {currentPage} of{" "}
              {totalPages}
            </Text>

            <View
              style={
                userProfileStyles.paginationButtons
              }
            >
              <Text
                onPress={() => {
                  if (currentPage > 1) {
                    setCurrentPage(
                      (page) => page - 1
                    );
                  }
                }}
                style={[
                  userProfileStyles.pageButton,
                  currentPage === 1 &&
                    userProfileStyles.disabledPageButton,
                ]}
              >
                Previous
              </Text>

              <Text
                onPress={() => {
                  if (
                    currentPage <
                    totalPages
                  ) {
                    setCurrentPage(
                      (page) => page + 1
                    );
                  }
                }}
                style={[
                  userProfileStyles.pageButton,
                  currentPage ===
                    totalPages &&
                    userProfileStyles.disabledPageButton,
                ]}
              >
                Next
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}