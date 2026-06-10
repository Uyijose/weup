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
export const resetProgress = (userId) => {
  console.log("[PROGRESS RESET]", userId)
  delete progressMap[userId]
}

export const generateThumbnail = async (videoSource, postId, isLocal = false) => {
console.log("generateThumbnail started", postId)

console.log("thumbnail using direct video url")

const inputPath = videoSource

console.log("[THUMBNAIL INPUT DIRECT]", inputPath)

const tmpImage = path.join(os.tmpdir(), `${postId}.jpg`)
const thumbStart = Date.now()

console.log("[THUMBNAIL SAFE START]", {
  inputPath,
  tmpImage
})

await new Promise((resolve, reject) => {
  let finished = false

  const command = ffmpeg(inputPath)
    .seekInput(1)
    .outputOptions([
      "-frames:v 1",
      "-q:v 2"
    ])
    .output(tmpImage)
    .on("start", cmd => {
      console.log("[THUMBNAIL CMD]", cmd)
    })
    .on("end", () => {
      finished = true
      console.log("[THUMBNAIL DONE]", {
        time: Date.now() - thumbStart
      })
      resolve()
    })
    .on("error", err => {
      finished = true
      console.log("[THUMBNAIL ERROR]", err.message)
      reject(err)
    })

  command.run()

  setTimeout(() => {
    if (!finished) {
      console.log("[THUMBNAIL FORCE TIMEOUT]")
      command.kill("SIGKILL")
      resolve()
    }
  }, 10000)
})

const fileKey = `thumbnails/${postId}.jpg`

if (!fs.existsSync(tmpImage)) {
  console.log("[THUMBNAIL ERROR] image not created", tmpImage)
  throw new Error("THUMBNAIL_NOT_CREATED")
}

console.log("[THUMBNAIL UPLOAD] starting", tmpImage)


await r2.send(new PutObjectCommand({
Bucket:process.env.R2_BUCKET_NAME,
Key:fileKey,
Body:fs.readFileSync(tmpImage),
ContentType:"image/jpeg"
}))

try {
  if (tmpImage && fs.existsSync(tmpImage)) {
    fs.unlinkSync(tmpImage)
    console.log("[THUMBNAIL CLEANUP] image deleted")
  } else {
    console.log("[THUMBNAIL CLEANUP] image not found")
  }
} catch (e) {
  console.log("[THUMBNAIL CLEANUP ERROR]", e.message)
}

console.log("[THUMBNAIL CLEANUP DONE]")

const url = `${process.env.R2_PUBLIC_URL}/${fileKey}`
if (!url) {
  console.log("[THUMBNAIL FALLBACK USED]")
  return ""
}
console.log("thumbnail generated",url)
return url
}

export const setProgress = (userId, percent, message) => {
const current = progressMap[userId]?.percent || 0

if (percent < current) {
  console.log("progress ignored (backward)", { current, incoming: percent, message })
  return
}

console.log("progress update", userId, percent, message)

progressMap[userId] = { percent, message }
}

export const getProgress = (userId) => {
return progressMap[userId] || { percent: -1, message: "no active upload" }
}

export const processVideo = async (fileKey,userId) => {

console.log("processVideo service started")

console.log("[PROCESS START] setting initial progress 10%");
setProgress(userId,10,"starting processing")
console.log("[PROGRESS] 10 start")

const tempPath = path.join(os.tmpdir(),`original-${Date.now()}.mp4`)
const compressedPath = path.join(os.tmpdir(),`compressed-${Date.now()}.mp4`)

console.log("downloading original video")

const obj = await r2.send(new GetObjectCommand({
Bucket:process.env.R2_BUCKET_NAME,
Key:fileKey
}))

const writeStream = fs.createWriteStream(tempPath)

let downloadedBytes = 0
const totalBytes = Number(obj.ContentLength || 0)

console.log("download started", { totalBytes })

obj.Body.on("data", chunk => {
  downloadedBytes += chunk.length

  if (totalBytes > 0) {
    const percent = Math.min(
      10 + Math.floor((downloadedBytes / totalBytes) * 40),
      50
    )
    setProgress(userId, percent, "downloading video")
    console.log("downloading", {
      downloadedBytes,
      totalBytes,
      percent
    })
  }
})

await new Promise((resolve, reject) => {
  let finished = false
  let lastProgressTime = Date.now()

  const timeoutChecker = setInterval(() => {
    const now = Date.now()
    if (now - lastProgressTime > 15000) {
      console.log("[DOWNLOAD TIMEOUT] no progress for 15s")
      cleanup()
      clearInterval(timeoutChecker)
      reject(new Error("DOWNLOAD_STALLED"))
    }
  }, 5000)

  const cleanup = () => {
    if (finished) return
    finished = true
    console.log("stream cleanup triggered")
    obj.Body.destroy()
    writeStream.destroy()
  }

  obj.Body.on("data", chunk => {
    lastProgressTime = Date.now()
  })

  obj.Body.on("error", (err) => {
    console.log("R2 read stream error", err.code || err.message)
    cleanup()
    clearInterval(timeoutChecker)
    reject(err)
  })

  writeStream.on("error", (err) => {
    console.log("file write stream error", err.code || err.message)
    cleanup()
    clearInterval(timeoutChecker)
    reject(err)
  })

  writeStream.on("finish", () => {
    console.log("file write stream finished")
    clearInterval(timeoutChecker)
    resolve()
  })

  obj.Body.pipe(writeStream)
})

console.log("download complete")

setProgress(userId,50,"download complete")
console.log("[PROGRESS] 50 download complete")

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

console.log("[DURATION CHECK]", duration);

if (duration > 1800) {
  console.log("[REJECTED] video too long", duration);

  setProgress(userId, 100, "video too long");

  fs.unlinkSync(tempPath);
  if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);

  throw new Error("VIDEO_TOO_LONG");
}

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

setProgress(userId,60,"processing video")
console.log("[PROGRESS] 60 processing")

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

setProgress(userId,75,"video uploaded")
console.log("[PROGRESS] 75 video uploaded")

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

let numParts = Math.ceil(duration / MAX_PART)

const remainder = duration % MAX_PART

console.log("[SPLIT CHECK]", { duration, remainder })

if (remainder > 0 && remainder < 15) {
  console.log("[MERGE SMALL LAST PART]", remainder)
  numParts = Math.floor(duration / MAX_PART)
}

console.log("number of parts",numParts)

setProgress(userId,65,"splitting video")

const splitTasks = []

for(let i=0;i<numParts;i++){

const start = i*MAX_PART
let partDuration = Math.min(MAX_PART, duration - start)

if (i === numParts - 1 && remainder > 0 && remainder < 15) {
  partDuration += remainder
  console.log("[LAST PART EXTENDED]", partDuration)
}
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

const parts = []

for (let i = 0; i < splitResults.length; i++) {
  const part = splitResults[i]

  console.log("[UPLOAD START]", part.index + 1)

  let uploaded = false
  let attempts = 0

  while (!uploaded && attempts < 3) {
    try {
      attempts++

      const fileName = `videos/${Date.now()}-part${part.index+1}.mp4`

      setProgress(
        userId,
        80 + Math.floor((i / splitResults.length) * 5),
        `uploading part ${part.index + 1} of ${splitResults.length}`
      )

      await r2.send(new PutObjectCommand({
        Bucket:process.env.R2_BUCKET_NAME,
        Key:fileName,
        Body:fs.createReadStream(part.partPath),
        ContentType:"video/mp4"
      }))

      const url = `${process.env.R2_PUBLIC_URL}/${fileName}`

      console.log("[UPLOAD SUCCESS]", part.index + 1)

      parts.push({
        partNumber: part.index + 1,
        url,
        duration: part.partDuration
      })

      fs.unlinkSync(part.partPath)

      uploaded = true

    } catch (err) {
      console.log("[UPLOAD RETRY]", part.index + 1, "attempt", attempts, err.message)

      if (attempts >= 3) {
        console.log("[UPLOAD FAILED FINAL]", part.index + 1)
        throw err
      }
    }
  }
}

console.log("all uploads complete")

fs.unlinkSync(tempPath)
if(fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath)

setProgress(userId,85,"parts uploaded")
console.log("[PROGRESS] 85 parts uploaded")

setProgress(userId,90,"generating thumbnail")
console.log("[PROGRESS] 90 generating thumbnail")

const firstPartUrl = parts[0]?.url
console.log("[THUMBNAIL SOURCE]", firstPartUrl)

const thumbnailUrl = await generateThumbnail(
  firstPartUrl,
  crypto.randomUUID(),
  false
)

console.log("thumbnailUrl created", thumbnailUrl)

return {
  isSingle:false,
  parts,
  thumbnailUrl
}

}
