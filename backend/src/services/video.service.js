import fs from "fs"
import path from "path"
import os from "os"
import ffmpeg from "fluent-ffmpeg"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { r2 } from "./r2.service.js"
import crypto from "crypto"
import fetch from "node-fetch"
import dotenv from "dotenv"
dotenv.config()
console.log("ENV loaded", process.env.SUPABASE_URL ? "yes" : "no")

export const progressMap = {}
export const generateThumbnail = async (videoUrl, postId) => {
console.log("generateThumbnail started", postId)

const tmpVideo = path.join(os.tmpdir(),`${postId}.mp4`)
const tmpImage = path.join(os.tmpdir(),`${postId}.jpg`)

const res = await fetch(videoUrl)
const buffer = await res.arrayBuffer()
fs.writeFileSync(tmpVideo, Buffer.from(buffer))

await new Promise((resolve,reject)=>{
ffmpeg(tmpVideo)
.screenshots({
count:1,
timemarks:["1"],
filename:`${postId}.jpg`,
folder:os.tmpdir(),
size:"1200x630"
})
.on("end",resolve)
.on("error",reject)
})

const fileKey = `thumbnails/${postId}.jpg`

await r2.send(new PutObjectCommand({
Bucket:process.env.R2_BUCKET_NAME,
Key:fileKey,
Body:fs.readFileSync(tmpImage),
ContentType:"image/jpeg"
}))

fs.unlinkSync(tmpVideo)
fs.unlinkSync(tmpImage)

const url = `${process.env.R2_PUBLIC_URL}/${fileKey}`
console.log("thumbnail generated",url)
return url
}

export const setProgress = (userId, percent, message) => {
console.log("progress update", userId, percent, message)
progressMap[userId] = { percent, message }
}

export const getProgress = (userId) => {
return progressMap[userId] || { percent: 0, message: "starting" }
}

export const processVideo = async (fileKey,userId) => {

console.log("processVideo service started")

setProgress(userId,10,"starting video processing")

const tempPath = path.join(os.tmpdir(),`original-${Date.now()}.mp4`)
const compressedPath = path.join(os.tmpdir(),`compressed-${Date.now()}.mp4`)

console.log("downloading original video")

const obj = await r2.send(new GetObjectCommand({
Bucket:process.env.R2_BUCKET_NAME,
Key:fileKey
}))

const writeStream = fs.createWriteStream(tempPath)

await new Promise((resolve,reject)=>{
obj.Body.pipe(writeStream)
obj.Body.on("error",reject)
writeStream.on("finish",resolve)
})

console.log("download complete")

setProgress(userId,25,"video downloaded")

console.log("starting parallel metadata detection")

const durationPromise = new Promise((resolve,reject)=>{
ffmpeg.ffprobe(tempPath,(err,data)=>{
if(err) reject(err)
else resolve(data.format.duration)
})
})

const sizePromise = fs.promises.stat(tempPath)

const [duration,stats] = await Promise.all([durationPromise,sizePromise])

const fileSizeMB = stats.size / (1024*1024)

console.log("video duration seconds",duration)
console.log("video size MB",fileSizeMB)

const durationMinutes = duration / 60
const allowedSize = durationMinutes * 10

console.log("allowed size MB",allowedSize)

let videoPath = tempPath

if(fileSizeMB > allowedSize){

console.log("compression required")

setProgress(userId,40,"compressing video")

await new Promise((resolve,reject)=>{

ffmpeg(tempPath)
.videoCodec("libx264")
.outputOptions([
"-vf scale='min(1280,iw)':-2",
"-preset ultrafast",
"-crf 28",
"-threads 0",
"-movflags +faststart"
])
.on("start",cmd=>console.log("ffmpeg compression command",cmd))
.on("end",resolve)
.on("error",reject)
.save(compressedPath)

})

console.log("compression complete")

videoPath = compressedPath

}else{

console.log("compression skipped")

}

setProgress(userId,55,"processing video")

const MAX_PART = 180

if (duration <= MAX_PART) {

console.log("single video path selected")

const fileName = `videos/${Date.now()}-single.mp4`

await r2.send(new PutObjectCommand({
Bucket: process.env.R2_BUCKET_NAME,
Key: fileName,
Body: fs.createReadStream(videoPath),
ContentType: "video/mp4"
}))

const url = `${process.env.R2_PUBLIC_URL}/${fileName}`

console.log("single video uploaded")

setProgress(userId,100,"single video upload complete")

fs.unlinkSync(tempPath)
if(fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath)

const thumbnailUrl = await generateThumbnail(url, crypto.randomUUID())
console.log("thumbnailUrl created", thumbnailUrl)

return {
isSingle:true,
videoUrl:url,
thumbnailUrl,
duration
}

}

console.log("multi part video processing")

const numParts = Math.ceil(duration / MAX_PART)

console.log("number of parts",numParts)

setProgress(userId,65,"splitting video")

const splitTasks = []

for(let i=0;i<numParts;i++){

const start = i*MAX_PART
const partDuration = Math.min(MAX_PART,duration-start)
const partPath = path.join(os.tmpdir(),`part-${i}-${Date.now()}.mp4`)

splitTasks.push(new Promise((resolve,reject)=>{

ffmpeg(videoPath)
.setStartTime(start)
.setDuration(partDuration)
.outputOptions(["-c copy"])
.on("start",cmd=>console.log("split command",cmd))
.on("end",()=>resolve({partPath,partDuration,index:i}))
.on("error",reject)
.save(partPath)

}))

}

const splitResults = await Promise.all(splitTasks)

console.log("all parts split complete")

setProgress(userId,80,"uploading parts")

const uploadTasks = splitResults.map(async(part)=>{

const fileName = `videos/${Date.now()}-part${part.index+1}.mp4`

await r2.send(new PutObjectCommand({
Bucket:process.env.R2_BUCKET_NAME,
Key:fileName,
Body:fs.createReadStream(part.partPath),
ContentType:"video/mp4"
}))

const url = `${process.env.R2_PUBLIC_URL}/${fileName}`

fs.unlinkSync(part.partPath)

console.log("uploaded part",part.index+1)

return {
partNumber:part.index+1,
url,
duration:part.partDuration
}

})

const parts = await Promise.all(uploadTasks)

console.log("all uploads complete")

fs.unlinkSync(tempPath)
if(fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath)

setProgress(userId,100,"processing complete")

const thumbnailUrl = await generateThumbnail(parts[0].url, crypto.randomUUID())
console.log("thumbnailUrl created", thumbnailUrl)

return {
isSingle:false,
parts,
thumbnailUrl
}

}
