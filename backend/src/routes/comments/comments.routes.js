import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createCommentNotification,
} from "../../services/notifications/notifications.service.js";

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

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
  return res.json(data);
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

  if (error) {
    console.error(
      "[COMMENTS] INSERT ERROR",
      error
    );

    return res.status(400).json({
      error: error.message,
    });
  }

  console.log(
    "[COMMENTS] COMMENT CREATED",
    {
      commentId: data.id,
      postId: data.post_id,
      actorId: req.user.id,
    }
  );

  if (data.post_id) {
    console.log(
      "[COMMENTS] FETCHING POST OWNER",
      data.post_id
    );

    const { data: post, error: postError } =
      await supabase
        .from("posts")
        .select("id,user_id")
        .eq("id", data.post_id)
        .single();

    if (postError) {
      console.error(
        "[COMMENTS] FAILED TO FETCH POST OWNER",
        postError
      );
    } else {
      console.log(
        "[COMMENTS] POST OWNER FOUND",
        post
      );

      if (post?.user_id) {
        const { data: actor, error: actorError } =
          await supabase
            .from("users")
            .select("username,full_name")
            .eq("id", req.user.id)
            .maybeSingle();

        if (actorError) {
          console.error(
            "[COMMENTS] FAILED TO FETCH ACTOR",
            actorError
          );
        }

        const actorName =
          actor?.full_name ||
          actor?.username ||
          "Someone";

        console.log(
          "[COMMENTS] CREATING NOTIFICATION",
          {
            recipientId: post.user_id,
            actorId: req.user.id,
            postId: post.id,
            actorName,
          }
        );

        try {
          const notification =
            await createCommentNotification({
              recipientId: post.user_id,
              actorId: req.user.id,
              postId: post.id,
              actorName,
            });

          console.log(
            "[COMMENTS] NOTIFICATION CREATED",
            notification
          );
        } catch (notificationError) {
          console.error(
            "[COMMENTS] NOTIFICATION ERROR",
            notificationError
          );
        }
      } else {
        console.log(
          "[COMMENTS] POST HAS NO OWNER",
          post
        );
      }
    }
  }

  return res.json(data);
});

export default router;
