// test_run/getComments.js
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

async function fetchComments() {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        comment,
        created_at,
        post_id,
        posts (
          caption
        ),
        users (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Write to JSON file
    fs.writeFileSync(
      path.resolve(__dirname, 'comments.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Fetched ${data.length} comments with post and user info`);
  } catch (err) {
    console.error('❌ Error fetching comments:', err.message);
  }
}

fetchComments();
