// createPost.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase URL or SERVICE ROLE key is missing. Check your .env.local file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createPost() {
  try {
    const payload = {
      user_id: 'd08dd514-b410-4659-818f-7141a7529eb4',
      caption: 'Test video post',
      topic: 'TestTopic',
      song_name: 'Original Sound - Node.js Test',
      profile_image: null,
      company: 'test@example.com',
      video_url: 'https://vquensdjdnnjhjtxslsc.supabase.co/storage/v1/object/public/videos/test.mp4',
      likes_count: 0
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single();

    console.log("INSERT RESULT:", data, error);

    if (error) throw error;

    fs.writeFileSync('test_run/createPostResult.json', JSON.stringify(data, null, 2));
    console.log('Post created successfully! Details saved to createPostResult.json');
  } catch (err) {
    console.error('Error creating post:', err.message);
  }
}

createPost();
