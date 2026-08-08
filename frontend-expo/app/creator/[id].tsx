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
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { supabase } from "../../lib/supabase";

import { useAuthStore } from "../../stores/authStore";
import { useUsersStore } from "../../stores/usersStore";

import CreatorHeader from "../../components/creator/CreatorHeader";
import CreatorStats from "../../components/creator/CreatorStats";
import CreatorDescription from "../../components/creator/CreatorDescription";
import CreatorVideoGrid from "../../components/creator/CreatorVideoGrid";

import {
  CreatorVideo,
} from "../../components/creator/CreatorVideoCard";

import { creatorProfileStyles } from "../../styles/creator/creatorProfile.styles";

const VIDEO_PREVIEW_LIMIT = 6;

export default function CreatorProfileScreen() {
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

  const fetchCreatorByUsername =
    useUsersStore(
      (state) => state.fetchCreatorByUsername
    );

  const checkSubscription =
    useUsersStore(
      (state) => state.checkSubscription
    );

  const getSubscriberCount =
    useUsersStore(
      (state) => state.getSubscriberCount
    );

  const toggleSubscription =
    useUsersStore(
      (state) => state.toggleSubscription
    );

  const usersLoading = useUsersStore(
    (state) => state.loading
  );

  const [creator, setCreator] =
    useState<Record<string, any> | null>(null);

  const [videos, setVideos] =
    useState<CreatorVideo[]>([]);

  const [isSubscribed, setIsSubscribed] =
    useState(false);

  const [subscriptionLoading, setSubscriptionLoading] =
    useState(false);

  const [videosLoading, setVideosLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadCreator = useCallback(
    async () => {
      if (!id) {
        return;
      }

      const decodedUsername =
        decodeURIComponent(id);

      const creatorUser =
        await fetchCreatorByUsername(
          decodedUsername,
          true
        );

      if (!creatorUser?.id) {
        setCreator(creatorUser);
        setVideos([]);
        return;
      }

      const subscriberCount =
        await getSubscriberCount(
          String(creatorUser.id)
        );

      const creatorWithSubscriberCount = {
        ...creatorUser,
        subscribers_count: subscriberCount,
      };

      setCreator(creatorWithSubscriberCount);

      setVideosLoading(true);

      try {
        const { data, error } =
          await supabase
            .from("posts")
            .select("*")
            .eq("user_id", creatorUser.id)
            .order("created_at", {
              ascending: false,
            });

        if (error) {
          console.log(
            "[CREATOR VIDEOS] Failed to load videos:",
            error
          );

          setVideos([]);
          return;
        }

        setVideos(
          (data ?? []) as CreatorVideo[]
        );
      } finally {
        setVideosLoading(false);
      }
    },
    [
      id,
      fetchCreatorByUsername,
      getSubscriberCount,
    ]
  );

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    loadCreator();
  }, [loadCreator]);

  useEffect(() => {
    if (!authUser?.id || !creator?.id) {
      setIsSubscribed(false);
      return;
    }

    if (
      String(authUser.id) ===
      String(creator.id)
    ) {
      setIsSubscribed(false);
      return;
    }

    let active = true;

    const loadSubscriptionStatus =
      async () => {
        const subscribed =
          await checkSubscription(
            String(authUser.id),
            String(creator.id)
          );

        if (active) {
          setIsSubscribed(subscribed);
        }
      };

    loadSubscriptionStatus();

    return () => {
      active = false;
    };
  }, [
    authUser?.id,
    creator?.id,
    checkSubscription,
  ]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadCreator();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!authUser?.id || !creator?.id) {
      return;
    }

    if (
      String(authUser.id) ===
      String(creator.id)
    ) {
      return;
    }

    if (subscriptionLoading) {
      return;
    }

    const previousSubscribed =
      isSubscribed;

    const previousCount =
      Number(
        creator.subscribers_count ?? 0
      );

    setSubscriptionLoading(true);

    setIsSubscribed(!previousSubscribed);

    setCreator((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        subscribers_count:
          previousSubscribed
            ? Math.max(
                0,
                previousCount - 1
              )
            : previousCount + 1,
      };
    });

    const result =
      await toggleSubscription(
        String(authUser.id),
        String(creator.id),
        previousSubscribed
      );

    if (!result.success) {
      setIsSubscribed(previousSubscribed);

      setCreator((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          subscribers_count:
            previousCount,
        };
      });
    } else {
      setIsSubscribed(
        result.subscribed
      );

      const updatedSubscriberCount =
        await getSubscriberCount(
          String(creator.id)
        );

      setCreator((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          subscribers_count:
            updatedSubscriberCount,
        };
      });
    }

    setSubscriptionLoading(false);
  };

  const isOwner = useMemo(() => {
    if (!authUser?.id || !creator?.id) {
      return false;
    }

    return (
      String(authUser.id) ===
      String(creator.id)
    );
  }, [
    authUser?.id,
    creator?.id,
  ]);

  const visibleVideos = useMemo(() => {
    return videos.slice(
      0,
      VIDEO_PREVIEW_LIMIT
    );
  }, [videos]);

  const handleViewAll = () => {
    if (!creator?.id) {
      return;
    }

    router.push({
      pathname: "/creator/videos",
      params: {
        id: creator.id,
      },
    });
  };

  const handleDeleteVideo = async (
    videoId: string
    ) => {
    if (!isOwner || !creator?.id) {
        return;
    }

    const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", videoId)
        .eq("user_id", creator.id);

    if (error) {
        console.log(
        "[CREATOR DELETE VIDEO ERROR]",
        error
        );
        return;
    }

    setVideos((current) =>
        current.filter(
        (video) => video.id !== videoId
        )
    );
  };

  if (authLoading || usersLoading) {
    return (
      <SafeAreaView
        style={creatorProfileStyles.container}
      >
        <View
          style={
            creatorProfileStyles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color="#6A00F4"
          />

          <Text
            style={
              creatorProfileStyles.loadingText
            }
          >
            Loading creator...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!id || !creator) {
    return (
      <SafeAreaView
        style={creatorProfileStyles.container}
      >
        <View
          style={
            creatorProfileStyles.errorContainer
          }
        >
          <Text
            style={
              creatorProfileStyles.errorText
            }
          >
            Creator not found
          </Text>

          <Text
            style={
              creatorProfileStyles.errorDescription
            }
          >
            This creator may no longer exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (creator.is_creator !== true) {
    return (
      <SafeAreaView
        style={creatorProfileStyles.container}
      >
        <View
          style={
            creatorProfileStyles.errorContainer
          }
        >
          <Text
            style={
              creatorProfileStyles.errorText
            }
          >
            This user is not a creator.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={creatorProfileStyles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          creatorProfileStyles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6A00F4"
          />
        }
      >
        <View
          style={creatorProfileStyles.header}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              creatorProfileStyles.backButton
            }
            onPress={() => router.back()}
          >
            <Text
              style={
                creatorProfileStyles.backText
              }
            >
              ‹
            </Text>
          </TouchableOpacity>
        </View>

        <CreatorHeader
          avatarUrl={
            creator.creator_avatar_url ||
            creator.avatar_url
          }
          platformTitle={
            creator.platform_title
          }
          username={
            creator.creator_username
          }
        />

        <CreatorStats
          videos={
            videos.length
          }
          subscribers={
            creator.subscribers_count ?? 0
          }
          views={
            creator.creator_views ?? 0
          }
          wup={0}
        />

        {isOwner && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              creatorProfileStyles.subscribeButton
            }
            onPress={() =>
              router.push("/creator/videos")
            }
          >
            <Text
              style={
                creatorProfileStyles.subscribeText
              }
            >
              Manage Videos
            </Text>
          </TouchableOpacity>
        )}

        {authUser &&
          creator &&
          !isOwner && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={
                creatorProfileStyles.subscribeButton
              }
              onPress={handleSubscribe}
              disabled={subscriptionLoading}
            >
              <Text
                style={
                  creatorProfileStyles.subscribeText
                }
              >
                {subscriptionLoading
                  ? "..."
                  : isSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
              </Text>
            </TouchableOpacity>
          )}

        <CreatorDescription
          description={
            creator.creator_description
          }
        />

        <View
          style={
            creatorProfileStyles.sectionHeader
          }
        >
          <Text
            style={
              creatorProfileStyles.sectionTitle
            }
          >
            Videos
          </Text>

          {videos.length > 0 && (
            <Text
              style={
                creatorProfileStyles.sectionCount
              }
            >
              {videos.length}{" "}
              {videos.length === 1
                ? "video"
                : "videos"}
            </Text>
          )}
        </View>

        <CreatorVideoGrid
          videos={visibleVideos}
          loading={videosLoading}
          canDelete={isOwner}
          showAll={
            videos.length >
            VIDEO_PREVIEW_LIMIT
          }
          onViewAll={handleViewAll}
          onDelete={handleDeleteVideo}
        />
      </ScrollView>
    </SafeAreaView>
  );
}