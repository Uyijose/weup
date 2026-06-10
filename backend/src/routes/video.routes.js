import express from "express"
import { supabase } from "../services/supabase.service.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { setProgress, processVideo, generateThumbnail, resetProgress } from "../services/video.service.js"
import crypto from "crypto"

const router = express.Router()

router.post("/process", requireAuth, async (req, res) => {
  try {

console.log("process video route started")
resetProgress(req.user.id)

const {fileKey,caption,topic} = req.body
const userId = req.user.id
const email = req.user.email

const result = await processVideo(fileKey,userId)

console.log("processVideo return shape", {
  isArray: Array.isArray(result),
  isSingle: result?.isSingle,
  hasParts: !!result?.parts,
  hasVideoUrl: !!result?.videoUrl
})

console.log("video processed result", result)

let firstVideoUrl = ""

if (result.isSingle) {
  firstVideoUrl = result.videoUrl
  console.log("using single video url")
} else {
  firstVideoUrl = result.parts[0].url
  console.log("using first part as post video")
}

setProgress(userId,92,"saving post")
console.log("[PROGRESS] 92 saving post")

const thumbnailUrl = result.thumbnailUrl
console.log("thumbnailUrl to store in post", thumbnailUrl)

const {data:post,error} = await supabase
.from("posts")
.insert({
user_id:userId,
caption:caption,
topic:topic,
company:email,
video_url:firstVideoUrl,
thumbnail_url:thumbnailUrl
})
.select()
.single()

if(error){

console.log("database insert error",error)

return res.status(500).json(error)

}

console.log("post created",post.id)

setProgress(userId,95,"processing video parts")
console.log("[PROGRESS] 95 processing parts")

if (!result.isSingle) {
  console.log("inserting video parts with thumbnails")

  console.log("inserting video parts with shared thumbnail")

  for (const part of result.parts) {
    await supabase
      .from("video_parts")
      .insert({
        post_id: post.id,
        part_number: part.partNumber,
        video_url: part.url,
        duration: part.duration,
        thumbnail_url: thumbnailUrl // 👈 SAME thumbnail for all parts
      })

    console.log("inserted part", part.partNumber)
  }

} else {
  console.log("skipping video_parts insert for single video")
}

console.log("all parts inserted")

setProgress(userId,100,"processing complete")
console.log("[PROGRESS] 100 processing complete (FINAL)")

res.json({
  success: true,
  postId: post.id,
  hasParts: !result.isSingle
})

} catch (err) {
    console.log("[PROCESS FAILED]", err.code || err.message)

    setProgress(req.user.id, -1, "upload failed")

  if (err.message === "VIDEO_TOO_LONG") {
    return res.status(400).json({
      success: false,
      error: "Video exceeds 30 minutes limit"
    })
  }

  res.status(500).json({
    success: false,
    error: "video processing failed"
  })
}

})

export default router