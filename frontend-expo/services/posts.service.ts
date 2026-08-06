// frontend-expo/services/posts.service.ts

import { supabase } from "../lib/supabase";

import {
  Post,
  VideoPart,
  ViewerPost,
} from "../types/post";

/**
 * Converts a normal post into the object
 * consumed by the Post Viewer.
 */
function buildViewerPost(post: Post): ViewerPost {
  return {
    id: post.id,

    type: "post",

    post_id: post.id,

    part_number: null,

    caption: post.caption,

    topic: post.topic,

    song_name: post.song_name,

    company: post.company,

    video_url: post.video_url ?? "",

    thumbnail_url: post.thumbnail_url,

    user_id: post.user_id,

    likes_count: post.likes_count,

    comments_count: post.comments_count,

    views_count: post.views_count,

    created_at: post.created_at,

    updated_at: post.updated_at,

    users: post.users,

    original_post: post,

    parts_count: post.video_parts.length,
  };
}

/**
 * Converts one video part into
 * a ViewerPost.
 */
function buildViewerPart(
  post: Post,
  part: VideoPart
): ViewerPost {
  return {
    id: `${post.id}-part-${part.part_number}`,

    type: "part",

    post_id: post.id,

    video_part_id: part.id,

    part_number: part.part_number,

    caption: post.caption,

    topic: post.topic,

    song_name: post.song_name,

    company: post.company,

    video_url: part.video_url,

    thumbnail_url:
      part.thumbnail_url ??
      post.thumbnail_url,

    user_id:
      part.user_id ??
      post.user_id,

    likes_count:
      part.likes_count,

    comments_count:
      part.comments_count,

    views_count:
      part.views_count,

    created_at:
      part.created_at,

    updated_at:
      post.updated_at,

    users: post.users,

    original_post: post,

    parts_count:
      post.video_parts.length,
  };
}

/**
 * Fetches one post from Supabase.
 */
export async function getPostById(
  id: string
): Promise<Post | null> {
  const { data, error } =
    await supabase
      .from("posts")
      .select(
        `
        *,
        users (
          *
        ),
        video_parts (
          *
        )
      `
      )
      .eq("id", id)
      .single();

  if (error) {
    console.log(
      "[POST SERVICE]",
      error.message
    );

    return null;
  }

  return {
    ...data,
    users: data.users ?? null,
    video_parts:
      data.video_parts ?? [],
  } as Post;
}

/**
 * Returns every playable item
 * belonging to a post.
 *
 * Single video:
 *
 * [
 *   ViewerPost
 * ]
 *
 * Multi-part:
 *
 * [
 *   Part 1,
 *   Part 2,
 *   Part 3
 * ]
 */
export async function getExpandedPost(
  id: string
): Promise<ViewerPost[]> {
  const post =
    await getPostById(id);

  if (!post) {
    return [];
  }

  const parts = [
    ...(post.video_parts ?? []),
  ].sort(
    (a, b) =>
      a.part_number -
      b.part_number
  );

  if (parts.length === 0) {
    return [
      buildViewerPost(post),
    ];
  }

  return parts.map((part) =>
    buildViewerPart(post, part)
  );
}

/**
 * Returns the correct viewer item.
 *
 * Supports:
 *
 * post id
 *
 * 550e...
 *
 * composite id
 *
 * 550e...-part-2
 */
export async function getPostByCompositeId(
  id: string
): Promise<ViewerPost | null> {
  if (!id.includes("-part-")) {
    const posts =
      await getExpandedPost(id);

    return posts[0] ?? null;
  }

  const [postId, part] =
    id.split("-part-");

  const partNumber =
    Number(part);

  const posts =
    await getExpandedPost(
      postId
    );

  return (
    posts.find(
      (post) =>
        post.part_number ===
        partNumber
    ) ?? null
  );
}

/**
 * Fetch every post and expand multipart
 * videos into individual viewer items.
 */
export async function getAllViewerPosts(): Promise<ViewerPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      users(
        *
      ),
      video_parts(
        *
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.log(
      "[POST SERVICE]",
      error.message
    );

    return [];
  }

  const viewerPosts: ViewerPost[] = [];

  for (const item of data ?? []) {
    const post = {
      ...item,
      users: item.users ?? null,
      video_parts: [...(item.video_parts ?? [])].sort(
        (a, b) => a.part_number - b.part_number
      ),
    } as Post;

    if (post.video_parts.length === 0) {
      viewerPosts.push(buildViewerPost(post));
      continue;
    }

    for (const part of post.video_parts) {
      viewerPosts.push(
        buildViewerPart(post, part)
      );
    }
  }

  return viewerPosts;
}