import { supabase } from "../lib/supabase";
import type { SearchAccount } from "../components/search/SearchAccountsSection";
import type { SearchPost } from "../components/search/SearchPostCard";

export async function searchCreators(
  query: string
): Promise<SearchAccount[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, creator_username, creator_avatar_url")
    .ilike("creator_username", `%${trimmedQuery}%`);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function searchPosts(
  query: string
): Promise<SearchPost[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select("id, caption, topic, video_url, user_id")
    .or(
      `caption.ilike.%${trimmedQuery}%,topic.ilike.%${trimmedQuery}%`
    );

  if (error) {
    throw error;
  }

  return data || [];
}

export async function search(query: string): Promise<{
  users: SearchAccount[];
  posts: SearchPost[];
}> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      users: [],
      posts: [],
    };
  }

  const [users, posts] = await Promise.all([
    searchCreators(trimmedQuery),
    searchPosts(trimmedQuery),
  ]);

  return {
    users,
    posts,
  };
}