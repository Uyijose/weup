import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

console.log("ENV loaded", process.env.SUPABASE_URL ? "yes" : "no");

/* -------------------------------------------------
   Resolve paths correctly (NO double backend)
-------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src/scripts/json
const OUTPUT_DIR = path.join(__dirname, "json");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "usersReport.json");

/* -------------------------------------------------
   Supabase client (SERVICE ROLE = bypass RLS)
-------------------------------------------------- */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const run = async () => {
  console.log("Generating users report...");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  /* ---------------- FETCH USERS ---------------- */
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select(`
      id,
      username,
      full_name,
      email,
      is_admin,
      is_creator,
      created_at
    `);

  if (usersError) {
    console.error("Failed to fetch users:", usersError);
    process.exit(1);
  }

  /* ---------------- FETCH SUBSCRIPTIONS ---------------- */
  const { data: subscriptions, error: subsError } = await supabase
    .from("subscriptions")
    .select("creator_id");

  if (subsError) {
    console.error("Failed to fetch subscriptions:", subsError);
    process.exit(1);
  }

  /* ---------------- COUNT SUBSCRIBERS PER CREATOR ---------------- */
  const subscriberMap = {};
  for (const sub of subscriptions) {
    subscriberMap[sub.creator_id] =
      (subscriberMap[sub.creator_id] || 0) + 1;
  }

  /* ---------------- CLASSIFY USERS ---------------- */
  const admins = [];
  const creators = [];
  const regularUsers = [];

  for (const user of users) {
    if (user.is_admin) {
      admins.push(user);
      continue;
    }

    if (user.is_creator) {
      creators.push({
        ...user,
        subscribers: subscriberMap[user.id] || 0
      });
      continue;
    }

    regularUsers.push(user);
  }

  /* ---------------- FINAL JSON ---------------- */
  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      users: users.length,
      admins: admins.length,
      creators: creators.length,
      regular_users: regularUsers.length
    },
    admins,
    creators,
    regular_users: regularUsers
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

  console.log("Users report generated successfully");
  console.log("Saved to:", OUTPUT_FILE);
};

run();
