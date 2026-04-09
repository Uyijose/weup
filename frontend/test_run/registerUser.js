import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase keys are missing in .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 🔑 User registration data
const newUser = {
  email: 'josejudy@gmail.com',
  full_name: 'Judy Crypto',
  password: 'password123', // plaintext password to be hashed
};

function generateUsername(fullName) {
  const parts = fullName.trim().split(' ').filter(Boolean);
  const first = parts[0]?.slice(0, 2).toLowerCase() || 'xx';
  const last = parts[1]?.slice(-2).toLowerCase() || 'xx';
  const randomDigits = Math.floor(Math.random() * 90 + 100); // 2 random digits
  const username = `${first}${last}${randomDigits}`;
  console.log('Generated username:', username);
  return username;
}

async function registerUser() {
  const logFile = path.resolve(__dirname, 'registerUser.json');
  const log = { timestamp: new Date().toISOString() };

  try {
    // 1️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    console.log('Hashed password:', hashedPassword);

    // 2️⃣ Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: newUser.email,
      email_confirm: true,
      password: newUser.password,
      user_metadata: { full_name: newUser.full_name },
    });

    if (authError && authError.message.includes('duplicate')) {
      throw new Error('User already exists in auth table');
    } else if (authError) throw authError;

    log.auth = authData;
    console.log('✅ Auth user created:', authData);

    const userId = authData.user?.id;
    if (!userId) throw new Error('No user ID returned from auth');

    // 3️⃣ Check if user exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (checkError && !checkError.code?.includes('PGRST116')) throw checkError;

    const generatedUsername = generateUsername(newUser.full_name);

    if (!existingUser) {
      // Insert new user row
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: newUser.email,
            full_name: newUser.full_name,
            username: generatedUsername,
            password: hashedPassword,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      log.usersTable = inserted;
      console.log('✅ Users table record inserted:', inserted);
    } else {
      // Update missing fields or username/password
      const updatePayload = {};
      if (!existingUser.full_name) updatePayload.full_name = newUser.full_name;
      if (!existingUser.username) updatePayload.username = generatedUsername;
      if (!existingUser.password) updatePayload.password = hashedPassword;
      if (!existingUser.avatar_url) updatePayload.avatar_url = null;

      if (Object.keys(updatePayload).length > 0) {
        const { data: updated, error: updateError } = await supabase
          .from('users')
          .update(updatePayload)
          .eq('id', userId)
          .select()
          .single();

        if (updateError) throw updateError;
        log.usersTable = updated;
        console.log('✅ Users table record updated:', updated);
      } else {
        log.usersTable = existingUser;
        console.log('ℹ️ Users table record already complete:', existingUser);
      }
    }

    fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
    console.log(`✅ Registration log saved to ${logFile}`);
  } catch (err) {
    console.error('❌ Error registering user:', err.message);
    log.error = err.message;
    fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  }
}

registerUser();