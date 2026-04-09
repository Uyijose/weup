import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import path from "path";

console.log("ENV loaded", process.env.SUPABASE_URL ? "yes" : "no");

/* -------------------------------------------------
   Supabase (SERVICE ROLE = bypass RLS)
-------------------------------------------------- */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const run = async () => {
  console.log("Generating random likes...");

  /* ---------------- FETCH USERS ---------------- */
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id,is_admin,is_creator");

  if (usersError) {
    console.error("Failed to fetch users:", usersError);
    process.exit(1);
  }

  // Only normal users and creators can like
  const eligibleUsers = users.filter(u => !u.is_admin);

  console.log("Eligible users for likes:", eligibleUsers.length);

  /* ---------------- FETCH POSTS ---------------- */
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id,views_count");

  if (postsError) {
    console.error("Failed to fetch posts:", postsError);
    process.exit(1);
  }

  /* ---------------- FETCH VIDEO_PARTS ---------------- */
  const { data: videoParts, error: vpError } = await supabase
    .from("video_parts")
    .select("id,views_count");

  if (vpError) {
    console.error("Failed to fetch video_parts:", vpError);
    process.exit(1);
  }

  /* ---------------- FETCH EXISTING LIKES ---------------- */
  const { data: existingLikes } = await supabase
    .from("likes")
    .select("user_id,post_id,video_part_id");

  const existingSet = new Set(
    existingLikes.map(
      l => `${l.user_id}-${l.post_id ?? l.video_part_id}`
    )
  );

  /* ---------------- COMBINE POSTS & VIDEO_PARTS ---------------- */
  const allItems = [
    ...posts.map(p => ({ type: "post", id: p.id, views_count: p.views_count })),
    ...videoParts.map(vp => ({ type: "video_part", id: vp.id, views_count: vp.views_count }))
  ];

  // Sort by views_count descending
  const sortedItems = allItems.sort((a, b) => b.views_count - a.views_count);

  /* ---------------- GENERATE LIKES ---------------- */
  const likesToInsert = [];

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];

    // Assign more likes to higher viewed items
    const maxLikes = 22;
    const minLikes = 12;

    // Linear distribution between max and min
    const likesCount = Math.round(maxLikes - (i * (maxLikes - minLikes) / (sortedItems.length - 1)));

    const shuffledUsers = shuffle(eligibleUsers);

    let count = 0;
    for (const user of shuffledUsers) {
      const key = `${user.id}-${item.id}`;
      if (!existingSet.has(key)) {
        likesToInsert.push({
          user_id: user.id,
          post_id: item.type === "post" ? item.id : null,
          video_part_id: item.type === "video_part" ? item.id : null
        });
        existingSet.add(key);
        count++;
      }
      if (count >= likesCount) break;
    }
  }

  console.log("Inserting likes:", likesToInsert.length);

  /* ---------------- INSERT ---------------- */
  if (likesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("likes")
      .insert(likesToInsert);

    if (insertError) {
      console.error("Insert failed:", insertError);
      process.exit(1);
    }
  }

  /* ---------------- UPDATE likes_count ---------------- */
  for (const item of allItems) {
    const count = likesToInsert.filter(
      l => (item.type === "post" ? l.post_id === item.id : l.video_part_id === item.id)
    ).length;

    await supabase
      .from(item.type === "post" ? "posts" : "video_parts")
      .update({ likes_count: count })
      .eq("id", item.id);
  }

  console.log("Likes generated successfully");
};

run();
