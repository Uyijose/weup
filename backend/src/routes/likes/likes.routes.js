import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createLikeNotification,
} from "../../services/notifications/notifications.service.js";

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

  const { error: likeError } = await supabase
    .from("likes")
    .insert({
      user_id: req.user.id,
      post_id: post_id || null,
      video_part_id: video_part_id || null,
    });

  if (likeError) {
    console.error(
      "[LIKES] INSERT ERROR",
      likeError
    );

    return res.status(400).json({
      error: likeError.message,
    });
  }

  /*
  * Only create a notification for post likes.
  */
  if (post_id) {
    const { data: post, error: postError } =
      await supabase
        .from("posts")
        .select("id,user_id")
        .eq("id", post_id)
        .single();

    if (postError) {
      console.error(
        "[LIKES] FAILED TO FETCH POST OWNER",
        postError
      );
    } else if (post?.user_id) {
      let actorName = "Someone";

      const { data: actor } = await supabase
        .from("users")
        .select("username,full_name")
        .eq("id", req.user.id)
        .maybeSingle();

      actorName =
        actor?.full_name ||
        actor?.username ||
        "Someone";

      try {
        await createLikeNotification({
          recipientId: post.user_id,
          actorId: req.user.id,
          postId: post.id,
          actorName,
        });
      } catch (notificationError) {
        /*
        * Do not make a successful like fail
        * just because notification creation failed.
        */
        console.error(
          "[LIKES] NOTIFICATION ERROR",
          notificationError
        );
      }
    }
  }

  return res.json({
    liked: true,
  });
});

export default router;
