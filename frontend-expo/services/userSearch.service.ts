import { supabase } from "../lib/supabase";

export type SearchUser = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  creator_username?: string | null;
  avatar_url?: string | null;
  is_creator?: boolean | null;
};

export async function searchUsers(
  query: string
): Promise<SearchUser[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const search = `%${trimmedQuery}%`;

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, username, full_name, creator_username, avatar_url, is_creator"
    )
    .or(
      `username.ilike.${search},full_name.ilike.${search},creator_username.ilike.${search}`
    )
    .limit(30);

  if (error) {
    console.log(
      "[USER SEARCH ERROR]",
      error
    );
    throw error;
  }

  return (data ?? []) as SearchUser[];
}