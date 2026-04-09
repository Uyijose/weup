import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { post_id, video_part_id } = req.query;

  const column = video_part_id ? "video_part_id" : "post_id";
  const value = video_part_id || post_id;

  const { data, error } = await supabase
    .from("comments")
    .select(`
      id,
      comment,
      image_url,
      created_at,
      post_id,
      video_part_id,
      user_id,
      users (
        username,
        avatar_url
      )
    `)
    .eq(column, value)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

router.post("/", requireAuth, async (req, res) => {
  const { post_id, video_part_id, comment, image_url } = req.body;

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: post_id || null,
      video_part_id: video_part_id || null,
      user_id: req.user.id,
      comment,
      image_url,
    })
    .select(`
      id,
      comment,
      image_url,
      created_at,
      post_id,
      video_part_id,
      user_id,
      users (
        username,
        avatar_url
      )
    `)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

export default router;
