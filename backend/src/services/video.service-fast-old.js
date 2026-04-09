import fs from "fs"
import path from "path"
import os from "os"
import ffmpeg from "fluent-ffmpeg"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { r2 } from "./r2.service.js"

export const progressMap = {}

export const setProgress = (userId, percent, message) => {
  console.log("progress update", userId, percent, message)
  progressMap[userId] = { percent, message }
}

export const getProgress = (userId) => {
  return progressMap[userId] || { percent: 0, message: "starting" }
}

export const processVideo = async (fileKey, userId) => {
  console.log("processVideo started")

  setProgress(userId, 10, "downloading video")

  const tempPath = path.join(os.tmpdir(), `original-${Date.now()}.mp4`)

  const obj = await r2.send(new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey
  }))

  await new Promise((resolve, reject) => {
    const write = fs.createWriteStream(tempPath)
    obj.Body.pipe(write)
    obj.Body.on("error", reject)
    write.on("finish", resolve)
  })

  console.log("video downloaded")

  setProgress(userId, 25, "reading metadata")

  const duration = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(tempPath, (err, data) => {
      if (err) reject(err)
      else resolve(data.format.duration)
    })
  })

  const stats = await fs.promises.stat(tempPath)
  const fileSizeMB = stats.size / (1024 * 1024)

  console.log("duration", duration)
  console.log("sizeMB", fileSizeMB)

  const allowedSize = (duration / 60) * 10

  let videoPath = tempPath

  if (fileSizeMB > allowedSize) {
    setProgress(userId, 40, "compressing video")

    const compressedPath = path.join(os.tmpdir(), `compressed-${Date.now()}.mp4`)

    await new Promise((resolve, reject) => {
      ffmpeg(tempPath)
        .videoCodec("libx264")
        .outputOptions([
          "-vf scale='min(1280,iw)':-2",
          "-preset ultrafast",
          "-crf 28",
          "-movflags +faststart"
        ])
        .on("start", cmd => console.log("ffmpeg cmd", cmd))
        .on("end", resolve)
        .on("error", reject)
        .save(compressedPath)
    })

    videoPath = compressedPath
  }

  setProgress(userId, 60, "uploading video")

  const MAX_PART = 180

  if (duration <= MAX_PART) {
    const fileName = `videos/${Date.now()}-single.mp4`

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: fs.createReadStream(videoPath),
      ContentType: "video/mp4"
    }))

    setProgress(userId, 100, "done")

    return {
      isSingle: true,
      videoUrl: `${process.env.R2_PUBLIC_URL}/${fileName}`,
      duration
    }
  }

  setProgress(userId, 70, "splitting video")

  const parts = []
  const totalParts = Math.ceil(duration / MAX_PART)

  for (let i = 0; i < totalParts; i++) {
    const partPath = path.join(os.tmpdir(), `part-${i}-${Date.now()}.mp4`)
    const start = i * MAX_PART

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(start)
        .setDuration(MAX_PART)
        .outputOptions(["-c copy"])
        .on("end", resolve)
        .on("error", reject)
        .save(partPath)
    })

    const fileName = `videos/${Date.now()}-part${i + 1}.mp4`

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: fs.createReadStream(partPath),
      ContentType: "video/mp4"
    }))

    fs.unlinkSync(partPath)

    parts.push({
      partNumber: i + 1,
      url: `${process.env.R2_PUBLIC_URL}/${fileName}`,
      duration: Math.min(MAX_PART, duration - start)
    })
  }

  setProgress(userId, 100, "done")

  return {
    isSingle: false,
    parts
  }
}
