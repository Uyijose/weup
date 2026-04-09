import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

console.log("ENV loaded", process.env.SUPABASE_URL ? "yes" : "no");

/* -------------------------------------------------
   Resolve paths correctly (NO double backend)
-------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src/scripts/json
const OUTPUT_DIR = path.join(__dirname, "json");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "postsReport.json");

/* -------------------------------------------------
   Supabase client (SERVICE ROLE = bypass RLS)
-------------------------------------------------- */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const run = async () => {
  console.log("Generating posts report...");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  /* ---------------- FETCH POSTS ---------------- */
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      caption,
      topic,
      video_url,
      created_at,
      likes_count,
      comments_count,
      views_count
    `);

  if (postsError) {
    console.error("Failed to fetch posts:", postsError);
    process.exit(1);
  }

  /* ---------------- FETCH VIDEO PARTS ---------------- */
  const { data: videoParts, error: vpError } = await supabase
    .from("video_parts")
    .select(`
      id,
      post_id,
      user_id,
      video_url,
      part_number,
      created_at,
      likes_count,
      comments_count,
      views_count
    `);

  if (vpError) {
    console.error("Failed to fetch video_parts:", vpError);
    process.exit(1);
  }

  /* ---------------- FORMAT DATA ---------------- */
  const formattedPosts = posts.map(p => ({
    type: "post",
    id: p.id,
    user_id: p.user_id,
    caption: p.caption,
    topic: p.topic,
    video_url: p.video_url,
    created_at: p.created_at,
    likes_count: p.likes_count,
    comments_count: p.comments_count,
    views_count: p.views_count
  }));

  const formattedVideoParts = videoParts.map(vp => ({
    type: "video_part",
    id: vp.id,
    post_id: vp.post_id,
    user_id: vp.user_id,
    video_url: vp.video_url,
    part_number: vp.part_number,
    created_at: vp.created_at,
    likes_count: vp.likes_count,
    comments_count: vp.comments_count,
    views_count: vp.views_count
  }));

  /* ---------------- FINAL REPORT ---------------- */
  const report = {
    generated_at: new Date().toISOString(),
    total_posts: posts.length,
    total_video_parts: videoParts.length,
    posts: formattedPosts,
    video_parts: formattedVideoParts
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

  console.log("Posts report generated successfully");
  console.log("Saved to:", OUTPUT_FILE);
};

run();
