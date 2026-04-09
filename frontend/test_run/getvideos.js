// test_run/getvideos.js
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
  throw new Error('Supabase URL or ANON key is missing. Check your .env.local file.');
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchVideos() {
  try {

    // Fetch posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        caption,
        topic,
        song_name,
        video_url,
        likes_count,
        comments_count,
        created_at,
        user_id,
        users (
          avatar_url,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    // Fetch video parts but IGNORE part_number = 1
    const { data: parts, error: partsError } = await supabase
      .from('video_parts')
      .select(`
        id,
        post_id,
        part_number,
        video_url,
        duration,
        created_at
      `)
      .neq('part_number', 1) // 🚀 Ignore Part 1
      .order('part_number', { ascending: true });

    if (partsError) throw partsError;

    // Group parts by post_id
    const partsMap = {};
    parts.forEach(part => {
      if (!partsMap[part.post_id]) {
        partsMap[part.post_id] = [];
      }
      partsMap[part.post_id].push(part);
    });

    const finalVideos = [];

    posts.forEach(post => {

      // Add original post video
      finalVideos.push({
        ...post,
        caption: post.caption,
        video_url: post.video_url
      });

      // Add video parts if they exist
      if (partsMap[post.id]) {

        partsMap[post.id].forEach(part => {
          finalVideos.push({
            ...post,
            id: part.id,
            caption: `${post.caption} (Part ${part.part_number})`,
            video_url: part.video_url,
            part_number: part.part_number
          });
        });

      }

    });

    fs.writeFileSync(
      path.resolve(__dirname, 'videos.json'),
      JSON.stringify(finalVideos, null, 2)
    );

    console.log(`✅ Fetched ${finalVideos.length} videos including parts`);

  } catch (err) {
    console.error('❌ Error fetching videos:', err.message);
  }
}

fetchVideos();
