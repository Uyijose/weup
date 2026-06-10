import express from "express";
import { supabase } from "../../services/supabase.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("[API POSTS] request received");

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        video_parts (
          id,
          post_id,
          part_number,
          video_url,
          likes_count,
          comments_count,
          views_count,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("[API POSTS] supabase error", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[API POSTS] raw posts count:", posts.length);

    const normalized = posts.map(post => ({
      ...post,
      video_parts: post.video_parts || []
    }));

    const withParts = normalized.filter(p => p.video_parts.length > 0);
    const withoutParts = normalized.filter(p => p.video_parts.length === 0);

    console.log(
      "[API POSTS] POSTS WITH PARTS",
      withParts.map(p => ({
        post_id: p.id,
        partsCount: p.video_parts.length
      }))
    );

    console.log(
      "[API POSTS] POSTS WITHOUT PARTS",
      withoutParts.map(p => p.id)
    );

    res.json(normalized);
  } catch (err) {
    console.log("[API POSTS] fatal error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
