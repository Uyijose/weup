import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import path from "path";

console.log("ENV loaded", process.env.SUPABASE_URL ? "yes" : "no");

/* -------------------------------------------------
   Supabase (SERVICE ROLE = bypass RLS)
-------------------------------------------------- */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const run = async () => {
  console.log("Generating random subscriptions...");

  /* ---------------- FETCH USERS ---------------- */
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id,is_admin,is_creator,posts_count");

  if (usersError) {
    console.error("Failed to fetch users:", usersError);
    process.exit(1);
  }

  const admins = users.filter(u => u.is_admin);
  const creators = users.filter(u => u.is_creator);
  const normalUsers = users.filter(u => !u.is_admin && !u.is_creator);

  console.log("Admins:", admins.length);
  console.log("Creators:", creators.length);
  console.log("Eligible subscribers:", normalUsers.length);

  /* ---------------- FETCH EXISTING SUBSCRIPTIONS ---------------- */
  const { data: existingSubs, error: subsError } = await supabase
    .from("subscriptions")
    .select("subscriber_id,creator_id");

  if (subsError) {
    console.error("Failed to fetch subscriptions:", subsError);
    process.exit(1);
  }

  const existingSet = new Set(
    existingSubs.map(s => `${s.subscriber_id}-${s.creator_id}`)
  );

  /* ---------------- SORT CREATORS BY POSTS ---------------- */
  const sortedCreators = [...creators].sort(
    (a, b) => b.posts_count - a.posts_count
  );

  const targetCounts = [16, 14, 13, 12];

  const subscriptionsToInsert = [];

  for (let i = 0; i < sortedCreators.length; i++) {
    const creator = sortedCreators[i];
    const target = targetCounts[i] ?? 10;

    const possibleSubscribers = shuffle(
      users.filter(
        u =>
          !u.is_admin &&
          u.id !== creator.id &&
          !existingSet.has(`${u.id}-${creator.id}`)
      )
    ).slice(0, target);

    for (const subscriber of possibleSubscribers) {
      subscriptionsToInsert.push({
        creator_id: creator.id,
        subscriber_id: subscriber.id
      });

      // Add to set to prevent duplicates within this run
      existingSet.add(`${subscriber.id}-${creator.id}`);
    }
  }

  console.log("Inserting subscriptions:", subscriptionsToInsert.length);

  /* ---------------- INSERT ---------------- */
  if (subscriptionsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert(subscriptionsToInsert);

    if (insertError) {
      console.error("Insert failed:", insertError);
      process.exit(1);
    }
  }

  /* ---------------- UPDATE COUNTS ---------------- */
  for (const creator of creators) {
    const count = await supabase
      .from("subscriptions")
      .select("*", { count: "exact" })
      .eq("creator_id", creator.id);

    await supabase
      .from("users")
      .update({ subscribers_count: count.count })
      .eq("id", creator.id);
  }

  for (const user of users) {
    const count = await supabase
      .from("subscriptions")
      .select("*", { count: "exact" })
      .eq("subscriber_id", user.id);

    await supabase
      .from("users")
      .update({ subscriptions_count: count.count })
      .eq("id", user.id);
  }

  console.log("Subscriptions generated successfully");
};

run();
