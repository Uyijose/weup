import dotenv from "dotenv";
dotenv.config(); // Load env variables first
console.log("ENV loaded", process.env.SUPABASE_URL ? "yes" : "no");

import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import fetch from "node-fetch";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { r2 } from "../services/r2.service.js";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client AFTER env is loaded
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TMP_DIR = "./tmp";
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

/**
 * Generate thumbnail for a video URL, upload to R2, return public URL
 */
async function generateThumbnail(videoUrl, id) {
  const videoPath = path.join(TMP_DIR, `${id}.mp4`);
  const thumbPath = path.join(TMP_DIR, `${id}.jpg`);

  // Download video
  const res = await fetch(videoUrl);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(videoPath, Buffer.from(buffer));

  // Generate screenshot
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
        .on("end", resolve)
        .on("error", reject)
        .screenshots({
        count: 1,
        timemarks: ["1"],
        filename: `${id}.jpg`,
        folder: TMP_DIR
        });
    });

  // Upload to R2
  const fileKey = `thumbnails/${id}.jpg`;
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      Body: fs.readFileSync(thumbPath),
      ContentType: "image/jpeg"
    })
  );

  // Cleanup
  if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
  if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

  return `${process.env.R2_PUBLIC_URL}/${fileKey}`;
}

const run = async () => {
  console.log("thumbnail backfill started");

  // Tables to process
  const tables = ["posts", "video_parts"];

  for (const table of tables) {
    console.log(`\nProcessing table: ${table}`);

    // Fetch rows that don't have thumbnail_url yet
    const { data: rows, error } = await supabase
      .from(table)
      .select("id, video_url")
      .is("thumbnail_url", null);

    if (error) {
      console.error(`Error fetching rows from ${table}:`, error);
      continue;
    }

    console.log(`${rows.length} rows to process in ${table}`);

    for (const row of rows) {
      console.log(`Processing ${table} row`, row.id);

      try {
        const publicUrl = await generateThumbnail(row.video_url, row.id);

        const { error: updateError } = await supabase
          .from(table)
          .update({ thumbnail_url: publicUrl })
          .eq("id", row.id);

        if (updateError) console.error(`Error updating ${table} row:`, updateError);
        else console.log(`Thumbnail saved for ${table} row`, row.id, publicUrl);
      } catch (err) {
        console.error(`Error processing ${table} row`, row.id, err);
      }
    }
  }

  console.log("\nThumbnail backfill completed for all tables");
};

run();
