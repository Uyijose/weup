import React from "react";
import { Text, View } from "react-native";
import SearchPostCard, {
  SearchPost,
} from "./SearchPostCard";
import { searchPostsSectionStyles } from "../../styles/search/searchPostsSection.styles";

type SearchPostsSectionProps = {
  posts: SearchPost[];
};

export default function SearchPostsSection({
  posts,
}: SearchPostsSectionProps) {
  return (
    <View style={searchPostsSectionStyles.container}>
      <Text style={searchPostsSectionStyles.title}>
        Posts
      </Text>

      {posts.length === 0 ? (
        <Text style={searchPostsSectionStyles.emptyText}>
          No posts found
        </Text>
      ) : (
        <View>
          {posts.map((post) => (
            <SearchPostCard
              key={post.id}
              post={post}
            />
          ))}
        </View>
      )}
    </View>
  );
}