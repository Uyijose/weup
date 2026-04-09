// test_run/addComment.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL or SERVICE ROLE key is missing.');
}

// 🔥 SERVICE ROLE CLIENT (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// IDs you provided
const POST_ID = 'd3575967-d8b0-469d-bc0e-201ab8ee958b';
const USER_ID = 'd08dd514-b410-4659-818f-7141a7529eb4';

async function addComment() {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: POST_ID,
        user_id: USER_ID,
        comment: '🔥 This video is clean! Testing comments from Node.js'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Comment added successfully');
    console.log(data);
  } catch (err) {
    console.error('❌ Error adding comment:', err.message);
  }
}

addComment();
