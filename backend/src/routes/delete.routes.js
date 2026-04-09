import express from "express";
import { supabase } from "../services/supabase.service.js";
import { r2 } from "../services/r2.service.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const router = express.Router();

function extractKeyFromUrl(url) {
  const base = process.env.R2_PUBLIC_URL;
  if (!url.startsWith(base)) return null;
  const key = url.replace(`${base}/`, "");
  console.log("Extracted R2 key:", key);
  return key;
}


async function deleteFromR2(key) {
  console.log("Deleting from R2:", key);
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  );
  console.log("Deleted from R2:", key);
}

router.delete("/", async (req, res) => {
  const { post_id, user_id } = req.body;

  if (!post_id || !user_id) return res.status(400).json({ success: false, error: "Missing post_id or user_id" });

  try {
    console.log("Fetching post");
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", post_id)
      .eq("user_id", user_id)
      .single();

    if (postError || !post) return res.status(404).json({ success: false, error: "Post not found" });

    console.log("Post found:", post.id);

    const deletedFiles = [];

    if (post.video_url) {
      const key = extractKeyFromUrl(post.video_url);
      if(key) {
        console.log("Deleting main video from R2:", key);
        await deleteFromR2(key);
        deletedFiles.push(key);
      } else {
        console.log("No valid R2 key found for main video");
      }
    }

    console.log("Fetching video parts");
    const { data: parts, error: partsError } = await supabase
      .from("video_parts")
      .select("*")
      .eq("post_id", post_id);

    if (partsError) throw partsError;

    for (const part of parts) {
      const key = extractKeyFromUrl(part.video_url);
      if(key) {
        console.log("Deleting video part from R2:", key);
        await deleteFromR2(key);
        deletedFiles.push(key);
      } else {
        console.log("No valid R2 key found for part");
      }
    }

    console.log("Deleting post from DB (video_parts will cascade)");
    const { error: deletePostError } = await supabase
      .from("posts")
      .delete()
      .eq("id", post_id)
      .eq("user_id", user_id);

    if (deletePostError) throw deletePostError;

    console.log("Delete successful");
    res.status(200).json({
      success: true,
      deleted_files: deletedFiles,
      deleted_parts_count: parts.length,
    });
  } catch (err) {
    console.log("Delete failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;