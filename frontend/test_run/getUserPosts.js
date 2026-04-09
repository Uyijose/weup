import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL or ANON key is missing.');
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔑 CHANGE THIS TO THE USER YOU WANT POSTS FOR
const USER_ID = 'd08dd514-b410-4659-818f-7141a7529eb4';

async function fetchUserPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        caption,
        topic,
        song_name,
        video_url,
        likes_count,
        created_at,
        user_id,
        users (
          avatar_url,
          full_name,
          email
        )
      `)
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false });

    if (error) throw error;

    fs.writeFileSync(
      path.resolve(__dirname, 'userPosts.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Fetched ${data.length} posts for user ${USER_ID}`);
  } catch (err) {
    console.error('❌ Error fetching user posts:', err.message);
  }
}

fetchUserPosts();
