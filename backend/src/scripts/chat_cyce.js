import "../utils/env.js";
import { createClient } from "@supabase/supabase-js";
process.setMaxListeners(50);

console.log("ENV CHECK:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "LOADED" : "MISSING"
});

/* =========================
   CONFIG
========================= */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjQxYmQ3MGM4LTM0NTgtNGQ5Yy1iMzg3LWRhZTg0NTVhNzU0MiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3BobWRoaHR4cnZ6Y251cHJmd2ZyLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3ZmUyMWJjOC01YmU1LTQwZjEtOWYzNi04ZTI0MzZiN2JkNDMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc2MzQ1NDgxLCJpYXQiOjE3NzYzNDE4ODEsImVtYWlsIjoidXRlam9lLmp1QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkN5YmVyIFNwYWNlIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NzU4MDU3OTZ9XSwic2Vzc2lvbl9pZCI6IjVlOTRhN2U5LTZlNzctNDZlZi04ZWFkLWFkMDNhNjE2MzY3YiIsImlzX2Fub255bW91cyI6ZmFsc2V9.XMyvmE_sx7Fx3CYLnfAdOEiDUu9PyoyUTiaPBI9nKxC1JIjqWYn2I2zLboikoHC_f766VHQohsqpscOyj9fK0g";

const TARGET_EMAIL = "obazeeuyijoe@gmail.com";

/* =========================
   SUPABASE CLIENT
========================= */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, full_name, email, avatar_url, online, last_seen")
    .eq("id", userId)
    .single();

  if (error) {
    console.log("PROFILE FETCH ERROR:", error.message);
    return null;
  }

  return data;
}

async function getIdentity(userId) {
  const profile = await getUserProfile(userId);

  const displayName =
    profile?.full_name ||
    profile?.username ||
    profile?.email ||
    "Unknown User";

  return {
    id: userId,
    username: profile?.username,
    full_name: profile?.full_name,
    email: profile?.email,
    displayName
  };
}

await supabase.auth.setSession({
  access_token: TOKEN,
  refresh_token: TOKEN
});

supabase.realtime.setAuth(TOKEN);

await setOnline();
async function setOnline() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) return;

  await supabase
    .from("users")
    .update({ online: true })
    .eq("id", userId);

  const profile = await getUserProfile(userId);

  console.log("USER ONLINE:", {
    id: userId,
    username: profile?.username,
    email: profile?.email
  });
}

async function setOffline() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) return;

  await supabase
    .from("users")
    .update({
      online: false,
      last_seen: new Date().toISOString()
    })
    .eq("id", userId);

  const profile = await getUserProfile(userId);

  console.log("USER OFFLINE:", {
    id: userId,
    username: profile?.username,
    last_seen: new Date().toISOString()
  });
}

let CURRENT_CONVERSATION_ID = null;
const seen = new Set();

let typingChannel = null;
let typingTimeout = null;
let isTyping = false;
let SELF = null;
let PARTNER = null;

function getLogName() {
  return SELF?.displayName || SELF?.username || SELF?.full_name || SELF?.email || "USER";
}

function log(...args) {
  console.log(`[${getLogName()}]`, ...args);
}


/* =========================
   GET OR CREATE CONVERSATION
========================= */
async function getOrCreateConversation() {
  const { data: userData, error: userErr } =
    await supabase.auth.getUser();

  if (userErr || !userData?.user) {
    console.error("Auth error:", userErr?.message);
    return;
  }

  const myId = userData.user.id;

  console.log("SELF USER ID LOADED:", myId);

  SELF = await getIdentity(myId);
  console.log("SELF IDENTITY LOADED:", SELF.displayName);
  const { data: targetUser, error: targetErr } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", TARGET_EMAIL)
    .single();
  if (targetErr || !targetUser) {
    console.error("Target user fetch failed");
    return;
  }

  const targetId = targetUser.id;

  console.log("TARGET USER ID LOADED:", targetId);

  PARTNER = await getIdentity(targetId);

  console.log("PARTNER IDENTITY LOADED:", {
    id: PARTNER.id,
    displayName: PARTNER.displayName,
    email: PARTNER.email
  });
  const { data: convoId, error: convoErr } = await supabase.rpc(
    "get_or_create_direct_conversation",
    {
      p_user_a: myId,
      p_user_b: targetId
    }
  );

  console.log("GET OR CREATE CONVERSATION RPC:", convoId, convoErr);

  if (!convoId || convoErr) {
    console.log("FAILED TO GET CONVERSATION");
    return;
  }

  CURRENT_CONVERSATION_ID = convoId;
  console.log("CONVERSATION ID LOCKED:", CURRENT_CONVERSATION_ID);

  subscribe();
}

/* =========================
   REALTIME LISTENER + TYPING
========================= */
function subscribe() {
  console.log("REALTIME: subscribing conversation:", CURRENT_CONVERSATION_ID);

  const channel = supabase.channel("messages-realtime");

  const presenceChannel = supabase.channel(
  `presence:${CURRENT_CONVERSATION_ID}`,
  {
    config: {
      presence: { key: CURRENT_CONVERSATION_ID }
    }
  }
);

presenceChannel
  .on("presence", { event: "sync" }, async () => {
    const state = presenceChannel.presenceState();
    console.log("CONVERSATION MEMBERS STATUS:");

    const { data: members } = await supabase
      .from("conversation_members")
      .select("user_id, users(online, last_seen, full_name, username)")
      .eq("conversation_id", CURRENT_CONVERSATION_ID);

    members.forEach(m => {
      const u = m.users;
      if (u.online) {
        console.log("-", u.full_name || u.username, "(online)");
      } else {
        console.log("-", u.full_name || u.username, "(last seen:", u.last_seen, ")");
      }
    });

    for (const key in state) {
      const user = state[key][0];
      const identity = await getIdentity(user.user_id);
      console.log("-", identity.displayName);
    }
  })
  .subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      const { data } = await supabase.auth.getUser();
      presenceChannel.track({
        user_id: data.user.id,
        joined_at: new Date().toISOString()
      });
    }
  });

  typingChannel = supabase.channel(`typing:${CURRENT_CONVERSATION_ID}`, {
    config: { broadcast: { self: false } }
  });

  channel
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${CURRENT_CONVERSATION_ID}`
      },
      (payload) => {
        (async () => {
          console.log("MESSAGE EVENT:", payload);

          const msg = payload.new;
          if (!msg) return;

          const myId = (await supabase.auth.getUser())?.data?.user?.id;

          const sender = await getIdentity(msg.sender_id);

          const senderName =
            msg.sender_id === myId
              ? (SELF?.displayName || "Me")
              : (sender?.displayName || "Unknown User");

          console.log("MESSAGE RECEIVED EVENT:", {
            sender_id: msg.sender_id,
            sender_name: senderName,
            content: msg.content,
            conversation_id: CURRENT_CONVERSATION_ID
          });

          console.log(`${senderName} sent: ${msg.content}`);

          console.log("RAW MESSAGE DEBUG:", {
            myId,
            sender_id: msg.sender_id,
            isMe: msg.sender_id === myId
          });

          await supabase
            .from("conversation_members")
            .update({ last_read_at: new Date().toISOString() })
            .eq("conversation_id", CURRENT_CONVERSATION_ID)
            .eq("user_id", myId);
        })();
      }
    )
    .subscribe((status) => {
    });

    supabase
      .channel("read-receipts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_members",
          filter: `conversation_id=eq.${CURRENT_CONVERSATION_ID}`
        },
        (payload) => {
          console.log(
            "READ RECEIPT UPDATE:",
            payload.new.user_id,
            "last_read_at:",
            payload.new.last_read_at
          );
        }
      )
      .subscribe((status) => {
      });

  typingChannel
    .on("broadcast", { event: "typing" }, async (payload) => {
      const data = payload?.payload;

      if (!data) return;

      const myId = await userId();

      if (data.user_id === myId) return;

      (async () => {
        const identity = await getIdentity(data.user_id);

        if (data.state === "typing") {
          console.log(`${identity.displayName} is typing...`);
        }

        if (data.state === "stop") {
          console.log(`${identity.displayName} stopped typing`);
        }
      })();
    })
    .subscribe((status) => {
    });
  startInput();
  setInterval(() => {
    console.log("CHAT ACTIVE:", CURRENT_CONVERSATION_ID);
  }, 30000);
}

/* =========================
   INPUT + TYPING EMITTER
========================= */
function startInput() {

  let buffer = "";
  let typingActive = false;
  const stdin = process.stdin;
  if (stdin.isTTY && typeof stdin.setRawMode === "function") {
    stdin.setRawMode(true);
  } else {
    console.log("RAW MODE NOT AVAILABLE, FALLING BACK");
  }

  stdin.resume();
  stdin.setEncoding("utf8");

  stdin.on("data", async (chunk) => {

    const key = chunk.toString();
    if (!typingChannel) return;

    if (key === "\u0003") {
      process.exit();
    }

    if (key === "\r" || key === "\n") {
      const message = buffer.trim();
      buffer = "";

      if (message.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        const userProfile = userId ? await getUserProfile(userId) : null;
        const senderId = userData?.user?.id;

        console.log(`${SELF?.displayName || "User"} sending message:`, message);

        const { error } = await supabase.from("messages").insert({
          conversation_id: CURRENT_CONVERSATION_ID,
          sender_id: senderId,
          content: message
        });

        console.log("SEND RESULT ERROR:", error);
      }

      if (typingActive) {
        typingActive = false;
        const res = await typingChannel.send({
          type: "broadcast",
          event: "typing",
          payload: {
            user_id: await userId(),
            state: "stop"
          }
        });
      }

      return;
    }

    buffer += key;

    if (!typingActive) {
      typingActive = true;
      const res = await typingChannel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: await userId(),
          state: "typing"
        }
      });
    }

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(async () => {
      typingActive = false;
      const res = await typingChannel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: await userId(),
          state: "stop"
        }
      });
    }, 700);
  });
}

async function userId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id;
}

process.on("SIGINT", async () => {
  await setOffline();
  process.exit();
});

/* =========================
   START
========================= */
getOrCreateConversation();
