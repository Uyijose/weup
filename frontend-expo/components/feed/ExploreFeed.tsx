import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";

import { useExploreStore } from "../../stores/exploreStore";
import { styles } from "../../styles/feed/exploreFeed.styles";

function Thumbnail({
  thumbnailUrl,
  videoUrl,
}: {
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
}) {
  const [uri, setUri] = useState<string | null>(
    thumbnailUrl ?? null
  );

  useEffect(() => {
    if (thumbnailUrl) {
      console.log(
        "[THUMBNAIL] database thumbnail",
        thumbnailUrl
      );

      setUri(thumbnailUrl);
      return;
    }

    if (!videoUrl) {
      console.log(
        "[THUMBNAIL] no thumbnail or video"
      );
      return;
    }

    const source = videoUrl;

    async function generate() {
      try {
        console.log(
          "[THUMBNAIL] generating",
          videoUrl
        );

        const result =
          await VideoThumbnails.getThumbnailAsync(
            source,
            {
              time: 1000,
            }
          );

        console.log(
          "[THUMBNAIL] generated",
          result.uri
        );

        setUri(result.uri);
      } catch (e) {
        console.log(
          "[THUMBNAIL ERROR]",
          e
        );
      }
    }

    generate();
  }, [thumbnailUrl, videoUrl]);

  if (!uri) {
    return (
      <View
        style={styles.placeholder}
      />
    );
  }

  return (
    <Image
      source={{
        uri,
      }}
      resizeMode="cover"
      style={styles.image}
    />
  );
}

export default function ExploreFeed() {
  const loading = useExploreStore(
    state => state.loading
  );

  const posts = useExploreStore(
    state => state.posts
  );

  const fetchPosts = useExploreStore(
    state => state.fetchPosts
  );

  const category = useExploreStore(
    state => state.category
  );

  const POSTS_PER_PAGE = 12;

  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(posts.length / POSTS_PER_PAGE)
  );

  const pagePosts = posts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
    fetchPosts();
  }, [category]);

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#FF4FA3"
        />
      </View>
    );
  }

  return (
    <FlatList
      data={pagePosts}
      keyExtractor={item =>
        String(item.id)
      }
      numColumns={3}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        console.log(
          "[POST]",
          {
            id: item.id,
            thumbnail: item.thumbnail_url,
            video: item.video_url,
          }
        );

        return (
          <View
            style={styles.card}
          >
            <Thumbnail
              thumbnailUrl={
                item.thumbnail_url
              }
              videoUrl={
                item.video_url
              }
            />

            <View style={styles.info}>
                <Text
                style={styles.title}
                >
                {item.caption ||
                    "Untitled"}
                </Text>

                <Text
                style={styles.creator}
                >
                @
                {item.users
                    ?.creator_username ??
                    "unknown"}
                </Text>
            </View>
          </View>
        );
      }}
    ListFooterComponent={
      totalPages > 1 ? (
        <View style={styles.pagination}>
          <Pressable
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
            style={[
              styles.pageButton,
              page === 1 && styles.disabledButton,
            ]}
          >
            <Text style={styles.pageButtonText}>
              Prev
            </Text>
          </Pressable>

          <Text style={styles.pageIndicator}>
            {page} / {totalPages}
          </Text>

          <Pressable
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
            style={[
              styles.pageButton,
              page === totalPages &&
                styles.disabledButton,
            ]}
          >
            <Text style={styles.pageButtonText}>
              Next
            </Text>
          </Pressable>
        </View>
      ) : null
    }
    />
  );
}