// frontend-expo/types/post.ts

export interface User {
  id: string;
  username: string | null;
  creator_username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  creator_avatar_url: string | null;
  email: string | null;

  is_admin: boolean;
  is_creator: boolean;
  is_adult: boolean;

  posts_count: number;
  comments_count: number;
  likes_count: number;

  subscribers_count: number;
  subscriptions_count: number;

  creator_views: number;
  videos_watched: number;

  creator_description: string | null;
  platform_title: string | null;

  online: boolean;
  last_seen: string | null;

  created_at: string;
  updated_at: string;
}

export interface VideoPart {
  id: string;

  post_id: string;

  part_number: number;

  video_url: string;

  thumbnail_url: string | null;

  duration: number | null;

  user_id: string | null;

  likes_count: number;
  comments_count: number;
  views_count: number;

  created_at: string;
}

export interface Post {
  id: string;

  caption: string | null;

  topic: string | null;

  song_name: string | null;

  company: string | null;

  video_url: string | null;

  thumbnail_url: string | null;

  user_id: string;

  likes_count: number;

  comments_count: number;

  views_count: number;

  is_hidden: boolean;

  created_at: string;

  updated_at: string;

  users: User | null;

  video_parts: VideoPart[];
}

/**
 * The object actually consumed by the native Post Viewer.
 *
 * A normal post becomes:
 *
 * {
 *   type: "post"
 * }
 *
 * Each video part becomes:
 *
 * {
 *   type: "part"
 *   id: `${post.id}-part-${part.part_number}`
 * }
 */
export interface ViewerPost {
  /**
   * Composite id used by the viewer.
   *
   * Examples:
   *
   * post:
   * 550e8400...
   *
   * part:
   * 550e8400...-part-2
   */
  id: string;

  type: "post" | "part";

  /**
   * Original post id.
   */
  post_id: string;

  /**
   * Only exists for video parts.
   */
  video_part_id?: string;

  /**
   * Null for a normal post.
   */
  part_number: number | null;

  caption: string | null;

  topic: string | null;

  song_name: string | null;

  company: string | null;

  video_url: string;

  thumbnail_url: string | null;

  user_id: string;

  likes_count: number;

  comments_count: number;

  views_count: number;

  created_at: string;

  updated_at: string;

  users: User | null;

  /**
   * Original database post.
   *
   * Useful later for:
   * - comments
   * - likes
   * - next part
   * - creator profile
   */
  original_post: Post;

  /**
   * Total number of parts on the parent post.
   */
  parts_count: number;
}