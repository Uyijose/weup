import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
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
import SearchInput from "../../components/search/SearchInput";
import SearchAccountsSection from "../../components/search/SearchAccountsSection";
import SearchPostsSection from "../../components/search/SearchPostsSection";
import { SearchPost } from "../../components/search/SearchPostCard";
import { SearchAccount } from "../../components/search/SearchAccountsSection";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { searchStyles } from "../../styles/search/search.styles";
import { search } from "../../services/search.service";

export default function SearchScreen() {
  const params = useLocalSearchParams<{
    q?: string | string[];
  }>();

  const queryParam = Array.isArray(params.q)
    ? params.q[0]
    : params.q;

  const query = (queryParam || "").trim();

  const [searchText, setSearchText] =
    useState(query);

  const [users, setUsers] = useState<
    SearchAccount[]
  >([]);

  const [posts, setPosts] = useState<
    SearchPost[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    console.log(
      "[SEARCH SCREEN] Query changed:",
      query
    );

    setSearchText(query);
  }, [query]);

  const runSearch = useCallback(
    async (isRefresh = false) => {
      console.log(
        "[SEARCH SCREEN] runSearch called",
        {
          query,
          isRefresh,
        }
      );

      if (!query) {
        console.log(
          "[SEARCH SCREEN] Empty query. Search cancelled."
        );

        setUsers([]);
        setPosts([]);
        setError(null);
        setLoading(false);
        setRefreshing(false);

        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      console.log(
        "[SEARCH SCREEN] Searching for:",
        query
      );

      try {
        const result = await search(query);

        console.log(
          "[SEARCH SCREEN] Search service returned:",
          {
            users: result.users.length,
            posts: result.posts.length,
          }
        );

        setUsers(result.users);
        setPosts(result.posts);
      } catch (searchError) {
        console.error(
          "[SEARCH SCREEN] Search failed:",
          searchError
        );

        setError(
          "Unable to load search results."
        );

        setUsers([]);
        setPosts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);

        console.log(
          "[SEARCH SCREEN] Search finished"
        );
      }
    },
    [query]
  );

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const handleSearchSubmit = (
    newQuery: string
  ) => {
    const trimmedQuery =
      newQuery.trim();

    console.log(
      "[SEARCH SCREEN] Search submitted:",
      trimmedQuery
    );

    if (!trimmedQuery) {
      console.log(
        "[SEARCH SCREEN] Empty search rejected"
      );

      return;
    }

    setSearchText(trimmedQuery);

    router.push({
      pathname: "/search",
      params: {
        q: trimmedQuery,
      },
    });
  };

  const handleRefresh = () => {
    console.log(
      "[SEARCH SCREEN] Refresh requested"
    );

    runSearch(true);
  };

  const handleRetry = () => {
    console.log(
      "[SEARCH SCREEN] Retry requested"
    );

    runSearch();
  };

  const handleBack = () => {
    console.log(
      "[SEARCH SCREEN] Back button pressed"
    );

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

  const renderContent = () => {
    if (loading) {
      console.log(
        "[SEARCH SCREEN] Showing loader"
      );

      return (
        <Loader
          message="Searching..."
        />
      );
    }

    if (error) {
      console.log(
        "[SEARCH SCREEN] Showing error state"
      );

      return (
        <View
          style={searchStyles.centerState}
        >
          <EmptyState
            title="Unable to load search results"
            message="Please try again."
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRetry}
            style={
              searchStyles.retryButton
            }
          >
            <Text
              style={
                searchStyles.retryText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (
      users.length === 0 &&
      posts.length === 0
    ) {
      console.log(
        "[SEARCH SCREEN] No results found"
      );

      return (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6A00F4"
            />
          }
          contentContainerStyle={
            searchStyles.listContent
          }
        >
          <EmptyState
            title="No results found"
            message={
              query
                ? `No results found for "${query}".`
                : "Try searching for a creator, topic, or caption."
            }
          />
        </ScrollView>
      );
    }

    console.log(
      "[SEARCH SCREEN] Showing search results"
    );

    return (
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6A00F4"
          />
        }
        contentContainerStyle={
          searchStyles.listContent
        }
      >
        <SearchAccountsSection
          users={users}
        />

        {users.length > 0 &&
        posts.length > 0 ? (
          <View
            style={
              searchStyles.sectionDivider
            }
          />
        ) : null}

        <SearchPostsSection
          posts={posts}
        />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={searchStyles.container}
    >
      <View style={searchStyles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={searchStyles.backButton}
        >
          <Text
            style={searchStyles.backText}
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View
          style={
            searchStyles.headerTextContainer
          }
        >
          <Text
            style={searchStyles.title}
            numberOfLines={1}
          >
            Search
          </Text>

          <Text
            style={searchStyles.query}
            numberOfLines={1}
          >
            {query
              ? `Results for: ${query}`
              : "Search for creators and posts"}
          </Text>
        </View>

        <View
          style={searchStyles.headerSpacer}
        />
      </View>

      <SearchInput
        value={searchText}
        onSubmit={handleSearchSubmit}
      />

      {renderContent()}
    </SafeAreaView>
  );
}