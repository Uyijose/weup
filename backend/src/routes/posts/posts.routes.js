import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsError) return res.status(400).json({ error: postsError.message });

    const { data: parts, error: partsError } = await supabase
      .from("video_parts")
      .select("*")
      .order("part_number", { ascending: true });

    if (partsError) return res.status(400).json({ error: partsError.message });

    const partsMap = {};
    parts.forEach(part => {
      if (!partsMap[part.post_id]) partsMap[part.post_id] = [];
      partsMap[part.post_id].push(part);
    });

    const finalFeed = [];
    posts.forEach(post => {
      const postParts = partsMap[post.id];
      if (!postParts) {
        finalFeed.push({ ...post });
      } else {
        postParts.forEach(part => {
          finalFeed.push({
            id: part.id,
            original_post_id: post.id,
            video_url: part.video_url,
            caption: `${post.caption} (Part ${part.part_number})`,
            part_number: part.part_number,

            user_id: post.user_id,
            topic: post.topic,
            song_name: post.song_name,
            created_at: part.created_at || post.created_at,

            likes_count: part.likes_count ?? 0,

            comments_count: part.comments_count ?? 0,
            video_part_comments_count: part.comments_count ?? 0,

            post_comments_count: post.comments_count ?? 0
          });
        });
      }
    });

    res.json(finalFeed);
  } catch (err) {
    console.log("Error fetching posts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
