import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase env missing');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function createPost() {
  try {
    const videoPath = path.resolve(__dirname, 'test-12.mp4');

    console.log('Uploading video to Cloudinary:', videoPath);

    const uploadResult = await cloudinary.uploader.upload(videoPath, {
      resource_type: 'video'
    });

    console.log('Cloudinary upload success:', uploadResult.secure_url);

    const payload = {
      user_id: 'd08dd514-b410-4659-818f-7141a7529eb4',
      caption: 'Cloudinary test video',
      topic: 'TestTopic',
      song_name: 'Original Sound',
      company: 'test@example.com',
      video_url: uploadResult.secure_url,
      likes_count: 0
    };

    console.log('Inserting post into Supabase:', payload);

    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single();

    console.log('INSERT RESULT:', data, error);

    if (error) throw error;

    fs.writeFileSync(
      path.resolve(__dirname, 'createPostCloudinaryResult.json'),
      JSON.stringify(data, null, 2)
    );

    console.log('Post created successfully');
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

createPost();
