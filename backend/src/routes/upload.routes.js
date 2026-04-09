import express from "express"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2 } from "../services/r2.service.js"
import { requireAuth } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/signed-url",requireAuth,async(req,res)=>{

console.log("signed url request received")

const { fileType } = req.body

console.log("fileType received", fileType)

let extension = "mp4"
let contentType = "video/mp4"

if (fileType === "image") {
  extension = "jpg"
  contentType = "image/jpeg"
}

let fileName = req.body.caption || req.body.originalFileName || `video_${Date.now()}`;
if(fileName.length > 30) fileName = fileName.slice(0, 30) + "...";
fileName = fileName.replace(/\s+/g, "_").replace(/[^\w\-\.]/g, "");
const fileKey = `uploads/${fileName}.${extension}`;
console.log("fileKey generated:", fileKey);

const command = new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: fileKey,
  ContentType: contentType
})

const uploadUrl = await getSignedUrl(r2,command,{expiresIn:3600})

console.log("signed url generated")

res.json({
uploadUrl,
fileKey
})

})

export default router