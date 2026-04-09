import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

const POST_ID = '9f64e1b6-8917-4f39-85d2-5273f198cf3b'
const USER_ID = 'd08dd514-b410-4659-818f-7141a7529eb4'

// 1772288715338-blob

function extractKeyFromUrl(url) {
  const base = process.env.R2_PUBLIC_URL
  return url.replace(`${base}/`, '')
}

async function deleteFromR2(key) {

  console.log('Deleting from R2:', key)

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  )

  console.log('Deleted from R2')
}

async function deletePost() {

  try {

    console.log('Fetching post')

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', POST_ID)
      .eq('user_id', USER_ID)
      .single()

    if (postError) throw postError

    console.log('Post found:', post.id)

    const deletedFiles = []

    // Delete main video
    if (post.video_url) {

      const key = extractKeyFromUrl(post.video_url)

      await deleteFromR2(key)

      deletedFiles.push(key)
    }

    console.log('Fetching video parts')

    const { data: parts, error: partsError } = await supabase
      .from('video_parts')
      .select('*')
      .eq('post_id', POST_ID)

    if (partsError) throw partsError

    for (const part of parts) {

      const key = extractKeyFromUrl(part.video_url)

      await deleteFromR2(key)

      deletedFiles.push(key)
    }

    console.log('Deleting video parts from DB')

    const { error: deletePartsError } = await supabase
      .from('video_parts')
      .delete()
      .eq('post_id', POST_ID)

    if (deletePartsError) throw deletePartsError

    console.log('Deleting post from DB')

    const { error: deletePostError } = await supabase
      .from('posts')
      .delete()
      .eq('id', POST_ID)
      .eq('user_id', USER_ID)

    if (deletePostError) throw deletePostError

    const result = {
      success: true,
      post_id: POST_ID,
      user_id: USER_ID,
      deleted_files: deletedFiles,
      deleted_parts_count: parts.length
    }

    const resultPath = path.resolve(__dirname, 'deletePostR2Result.json')

    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2))

    console.log('Delete successful')
    console.log('Result saved:', resultPath)

  } catch (err) {

    console.log('Delete failed')

    const result = {
      success: false,
      error: err.message
    }

    const resultPath = path.resolve(__dirname, 'deletePostR2Result.json')

    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2))

    console.error(err)
  }
}

deletePost()