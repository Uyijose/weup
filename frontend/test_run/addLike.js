// test_run/addLike.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL or SERVICE ROLE key is missing.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// IDs
const POST_ID = 'dda897e0-de02-4034-b4e9-5b88f8ad03f5';
const USER_ID = 'd08dd514-b410-4659-818f-7141a7529eb4';
// const COMMENT_ID = 3; // uncomment to like a comment instead

async function toggleLike() {
  try {
    // 1️⃣ Check if like already exists
    const { data: existingLike, error: fetchError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', USER_ID)
      .eq('post_id', POST_ID)
      .is('comment_id', null)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // 2️⃣ If exists → UNLIKE
    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;

      console.log('🗑️ Like removed');
      return;
    }

    // 3️⃣ Else → LIKE
    const { data, error: insertError } = await supabase
      .from('likes')
      .insert({
        post_id: POST_ID,
        user_id: USER_ID,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('✅ Like added');
    console.log(data);

  } catch (err) {
    console.error('❌ Toggle like failed:', err.message);
  }
}

toggleLike();
