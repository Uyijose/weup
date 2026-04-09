import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/state", requireAuth, async (req, res) => {
  const { post_id, video_part_id } = req.query;

  const column = video_part_id ? "video_part_id" : "post_id";
  const value = video_part_id || post_id;

  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", req.user.id)
    .eq(column, value)
    .maybeSingle();

  res.json({ hasLiked: !!data, likeId: data?.id ?? null });
});

router.post("/toggle", requireAuth, async (req, res) => {
  const { post_id, video_part_id } = req.body;

  const column = video_part_id ? "video_part_id" : "post_id";
  const value = video_part_id || post_id;

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", req.user.id)
    .eq(column, value)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    return res.json({ liked: false });
  }

  await supabase.from("likes").insert({
    user_id: req.user.id,
    post_id: post_id || null,
    video_part_id: video_part_id || null,
  });

  res.json({ liked: true });
});

export default router;
