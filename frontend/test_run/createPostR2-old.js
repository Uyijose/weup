import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { fileURLToPath } from 'url'
import ffmpeg from 'fluent-ffmpeg'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const r2Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const MAX_PART_DURATION = 180

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err)
      else resolve(metadata.format.duration)
    })
  })
}

async function compressVideo(inputPath, outputPath) {

  console.log('Starting smart compression')

  await new Promise((resolve, reject) => {

    ffmpeg(inputPath)

      .videoCodec('libx264')

      .outputOptions([
        '-vf scale=\'min(1280,iw)\':-2',
        '-preset veryfast',
        '-crf 28',
        '-maxrate 2500k',
        '-bufsize 5000k',
        '-profile:v high',
        '-level 4.1',
        '-pix_fmt yuv420p',
        '-movflags +faststart'
      ])

      .on('start', cmd => console.log('FFmpeg command:', cmd))

      .on('progress', p => {
        if (p.percent)
          console.log('Compression progress:', p.percent.toFixed(2) + '%')
      })

      .on('end', () => {
        console.log('Compression finished')
        resolve()
      })

      .on('error', err => reject(err))

      .save(outputPath)

  })

  if (!fs.existsSync(outputPath))
    throw new Error('Compression failed')

  const originalSize = fs.statSync(inputPath).size
  const compressedSize = fs.statSync(outputPath).size

  console.log('Original size:', (originalSize / 1024 / 1024).toFixed(2), 'MB')
  console.log('Compressed size:', (compressedSize / 1024 / 1024).toFixed(2), 'MB')

  return outputPath
}

async function splitVideo(videoPath, totalDuration) {

  console.log('Video duration:', totalDuration)

  const parts = []
  const numParts = Math.ceil(totalDuration / MAX_PART_DURATION)

  console.log('Splitting into parts:', numParts)

  for (let i = 0; i < numParts; i++) {

    const start = i * MAX_PART_DURATION
    const duration = Math.min(MAX_PART_DURATION, totalDuration - start)

    const partPath = path.join(
      os.tmpdir(),
      `part-${Date.now()}-${i + 1}.mp4`
    )

    console.log('Creating part', i + 1)

    await new Promise((resolve, reject) => {

      ffmpeg(videoPath)
        .setStartTime(start)
        .setDuration(duration)
        .outputOptions(['-c copy'])
        .on('end', resolve)
        .on('error', reject)
        .save(partPath)

    })

    parts.push({
      path: partPath,
      partNumber: i + 1,
      duration
    })
  }

  return parts
}

async function uploadToR2(filePath, fileName) {

  console.log('Uploading to R2:', fileName)

  const fileStream = fs.createReadStream(filePath)

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: fileStream,
      ContentType: 'video/mp4',
    })
  )

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`

  console.log('Upload success:', publicUrl)

  return publicUrl
}

async function createPost() {

  try {

    const videoPath = path.resolve(__dirname, 'test-11.mp4')

    const compressedPath = path.join(
      os.tmpdir(),
      `compressed-${Date.now()}.mp4`
    )

    console.log('Video path:', videoPath)

    const compressed = await compressVideo(videoPath, compressedPath)

    const duration = await getVideoDuration(compressed)

    let uploadedParts = []

    if (duration <= MAX_PART_DURATION) {

      console.log('Video under 3 minutes')

      const fileName = `video-${Date.now()}.mp4`

      const url = await uploadToR2(compressed, fileName)

      uploadedParts.push({
        partNumber: 1,
        url,
        duration
      })

    } else {

      console.log('Video longer than 3 minutes')

      const parts = await splitVideo(compressed, duration)

      for (const part of parts) {

        const fileName = `video-${Date.now()}-part${part.partNumber}.mp4`

        const url = await uploadToR2(part.path, fileName)

        uploadedParts.push({
          partNumber: part.partNumber,
          url,
          duration: part.duration
        })

        fs.unlinkSync(part.path)

        console.log('Deleted temp part')
      }
    }

    console.log('Creating post')

    const firstVideoUrl = uploadedParts[0].url

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: 'd08dd514-b410-4659-818f-7141a7529eb4',
        caption: 'Partition test upload',
        topic: 'TestTopic',
        song_name: 'Original Sound',
        company: 'utejoe',
        video_url: firstVideoUrl,
        likes_count: 0
      })
      .select()
      .single()

    if (error) throw error

    console.log('Post created:', post.id)

    for (const part of uploadedParts) {

      console.log('Inserting video part', part.partNumber)

      const { error } = await supabase
        .from('video_parts')
        .insert({
          post_id: post.id,
          part_number: part.partNumber,
          video_url: part.url,
          duration: part.duration
        })

      if (error) throw error
    }

    const result = { post, parts: uploadedParts }

    const resultPath = path.resolve(__dirname, 'createPostR2Result.json')

    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2))

    console.log('Result saved:', resultPath)

    fs.unlinkSync(compressed)

    console.log('Compressed temp deleted')

  } catch (err) {

    console.log('Script failed')
    console.error(err)
  }
}

createPost()