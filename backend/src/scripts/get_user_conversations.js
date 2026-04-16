import "../utils/env.js";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

/* =========================
   CONFIG
========================= */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Use auth token (same pattern as your script)
const TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjQxYmQ3MGM4LTM0NTgtNGQ5Yy1iMzg3LWRhZTg0NTVhNzU0MiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3BobWRoaHR4cnZ6Y251cHJmd2ZyLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3ZmUyMWJjOC01YmU1LTQwZjEtOWYzNi04ZTI0MzZiN2JkNDMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc2MzQ4OTg3LCJpYXQiOjE3NzYzNDUzODcsImVtYWlsIjoidXRlam9lLmp1QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkN5YmVyIFNwYWNlIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NzU4MDU3OTZ9XSwic2Vzc2lvbl9pZCI6IjVlOTRhN2U5LTZlNzctNDZlZi04ZWFkLWFkMDNhNjE2MzY3YiIsImlzX2Fub255bW91cyI6ZmFsc2V9.6_Id3NQLuxhP9mtqkAQjABXMeJv7oIZuKKuvrOmvZwpPoUFbjtawPmm2fSneWpdda1R5h_sfrNp6NBwYuAE05A";

// Optional: fetch another user by email
const TARGET_EMAIL = null; // or "user@email.com"

/* =========================
   INIT
========================= */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

await supabase.auth.setSession({
  access_token: TOKEN,
  refresh_token: TOKEN
});

/* =========================
   HELPERS
========================= */
async function getAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    console.error("Auth failed:", error?.message);
    return null;
  }
  return data.user;
}

async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, username")
    .eq("email", email)
    .single();

  if (error) {
    console.error("User fetch error:", error.message);
    return null;
  }

  return data;
}

/* =========================
   CORE LOGIC
========================= */
async function getUserConversations(userId) {
  // Step 1: get all conversations the user belongs to
  const { data: memberships, error: memberErr } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);

  if (memberErr) {
    console.error("Membership fetch error:", memberErr.message);
    return [];
  }

  const conversationIds = memberships.map(m => m.conversation_id);

  if (!conversationIds.length) return [];

  // Step 2: get conversations
  const { data: conversations, error: convoErr } = await supabase
    .from("conversations")
    .select("*")
    .in("id", conversationIds);

  if (convoErr) {
    console.error("Conversation fetch error:", convoErr.message);
    return [];
  }

  // Step 3: get messages per conversation
  const results = [];

  for (const convo of conversations) {
    const { data: messages, error: msgErr } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        sender_id,
        created_at
      `)
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true });

    if (msgErr) {
      console.error("Message fetch error:", msgErr.message);
      continue;
    }

    results.push({
      conversation: convo,
      messages: messages || []
    });
  }

  return results;
}

/* =========================
   RUN
========================= */
async function run() {
  let user;

  if (TARGET_EMAIL) {
    user = await getUserByEmail(TARGET_EMAIL);
  } else {
    user = await getAuthUser();
  }

  if (!user) {
    console.error("No user found");
    return;
  }

  console.log("FETCHING FOR USER:", user.email || user.id);

  const conversations = await getUserConversations(user.id);

  const output = {
    user,
    total_conversations: conversations.length,
    conversations
  };

  // Save as JSON file
  fs.writeFileSync(
    "./src/scripts/json/user_conversations.json",
    JSON.stringify(output, null, 2)
  );

  console.log("DONE ✅ File saved: user_conversations.json");
}

run();