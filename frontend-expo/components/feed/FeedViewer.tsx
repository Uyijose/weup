import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  ViewerPost,
} from "../../types/post";

import {
  getAllViewerPosts,
} from "../../services/posts.service";

import PostCard from "./PostCard";

export function FeedViewer() {
  const { height } =
    useWindowDimensions();

  const PAGE_HEIGHT =
    height - 80;

  const [posts, setPosts] =
    useState<ViewerPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const loadPosts =
    useCallback(async () => {
      try {
        const data =
          await getAllViewerPosts();

        setPosts(data);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh =
    useCallback(() => {
      setRefreshing(true);
      loadPosts();
    }, [loadPosts]);

  const renderItem:
    ListRenderItem<ViewerPost> =
    ({ item, index }) => (
      <View
        style={{
          width: "100%",
          height: PAGE_HEIGHT,
        }}
      >
        <PostCard
          post={item}
          isActive={
            currentIndex === index
          }
        />
      </View>
    );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            "center",
          alignItems:
            "center",
          backgroundColor:
            "#000",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#ffffff"
        />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            "center",
          alignItems:
            "center",
          backgroundColor:
            "#000",
        }}
      >
        <Text
          style={{
            color: "#fff",
          }}
        >
          No posts found.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) =>
        item.id
      }
      pagingEnabled
      decelerationRate="fast"
      snapToAlignment="start"
      showsVerticalScrollIndicator={
        false
      }
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={
            refreshing
          }
          onRefresh={
            onRefresh
          }
          tintColor="#ffffff"
        />
      }
      onViewableItemsChanged={({
        viewableItems,
      }) => {
        if (
          viewableItems.length >
          0
        ) {
          const index =
            viewableItems[0]
              .index;

          if (
            typeof index ===
            "number"
          ) {
            setCurrentIndex(
              index
            );
          }
        }
      }}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 80,
      }}
    />
  );
}

export default FeedViewer;