import express from "express"
import { supabase } from "../services/supabase.service.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { processVideo } from "../services/video.service.js"

const router = express.Router()

router.post("/process",requireAuth,async(req,res)=>{

console.log("process video route started")

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

if (!result.isSingle) {
  console.log("inserting video parts with thumbnails")

  for (const part of result.parts) {
    console.log("generating thumbnail for part", part.partNumber)
    const partThumbnail = await generateThumbnail(part.url, crypto.randomUUID())
    console.log("thumbnail generated for part", part.partNumber, partThumbnail)

    await supabase
      .from("video_parts")
      .insert({
        post_id: post.id,
        part_number: part.partNumber,
        video_url: part.url,
        duration: part.duration,
        thumbnail_url: partThumbnail
      })

    console.log("inserted part with thumbnail", part.partNumber)
  }
} else {
  console.log("skipping video_parts insert for single video")
}

console.log("all parts inserted")

res.json({
success:true,
postId:post.id
})

})

export default router