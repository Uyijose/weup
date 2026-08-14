import dotenv from "dotenv";

dotenv.config();

import { createClient } from "@supabase/supabase-js";

console.log(
  "[TEST] ENV loaded:",
  process.env.SUPABASE_URL ? "yes" : "no"
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const UTEJOE_ID =
  "7fe21bc8-5be5-40f1-9f36-8e2436b7bd43";

const UYI_JOE_ID =
  "fcf55afc-038f-4a77-a658-5a42214cc646";

const POST_ID =
  "9c7bbea1-8e50-4865-b06a-118cdcd4ebcb";

const run = async () => {
  console.log("[TEST] Starting like notification test");

  console.log("[TEST] Utejoe:", UTEJOE_ID);
  console.log("[TEST] Uyi Joe:", UYI_JOE_ID);
  console.log("[TEST] Post:", POST_ID);

  console.log("[TEST] Checking post...");

  const {
    data: post,
    error: postError,
  } = await supabase
    .from("posts")
    .select("id,user_id")
    .eq("id", POST_ID)
    .single();

  if (postError) {
    console.error(
      "[TEST] POST ERROR:",
      postError
    );

    process.exit(1);
  }

  console.log(
    "[TEST] POST FOUND:",
    post
  );

  console.log(
    "[TEST] Creating like from Utejoe..."
  );

  const {
    data: like,
    error: likeError,
  } = await supabase
    .from("likes")
    .insert({
      user_id: UTEJOE_ID,
      post_id: POST_ID,
      video_part_id: null,
    })
    .select()
    .single();

  if (likeError) {
    console.error(
      "[TEST] LIKE INSERT ERROR:",
      likeError
    );

    process.exit(1);
  }

  console.log(
    "[TEST] LIKE CREATED:",
    like
  );

  console.log(
    "[TEST] Fetching Utejoe details..."
  );

  const {
    data: actor,
    error: actorError,
  } = await supabase
    .from("users")
    .select("id,username,full_name")
    .eq("id", UTEJOE_ID)
    .single();

  if (actorError) {
    console.error(
      "[TEST] ACTOR ERROR:",
      actorError
    );

    process.exit(1);
  }

  console.log(
    "[TEST] ACTOR FOUND:",
    actor
  );

  const actorName =
    actor?.full_name ||
    actor?.username ||
    "Someone";

  console.log(
    "[TEST] Creating notification..."
  );

  const {
    data: notification,
    error: notificationError,
  } = await supabase
    .from("notifications")
    .insert({
      recipient_id: UYI_JOE_ID,
      actor_id: UTEJOE_ID,
      type: "like",
      title: "New like",
      body: `${actorName} liked your video.`,
      reference_id: POST_ID,
      reference_type: "post",
      read: false,
    })
    .select()
    .single();

  if (notificationError) {
    console.error(
      "[TEST] NOTIFICATION INSERT ERROR:",
      notificationError
    );

    process.exit(1);
  }

  console.log(
    "[TEST] NOTIFICATION CREATED:",
    notification
  );

  console.log(
    "[TEST] Verifying notification..."
  );

  const {
    data: verification,
    error: verificationError,
  } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", notification.id)
    .single();

  if (verificationError) {
    console.error(
      "[TEST] VERIFICATION ERROR:",
      verificationError
    );

    process.exit(1);
  }

  console.log(
    "[TEST] VERIFIED NOTIFICATION:"
  );

  console.log(
    JSON.stringify(
      verification,
      null,
      2
    )
  );

  console.log(
    "[TEST] SUCCESS: Utejoe liked Uyi Joe's post and the notification was created."
  );

  process.exit(0);
};

run().catch((error) => {
  console.error(
    "[TEST] UNEXPECTED ERROR:",
    error
  );

  process.exit(1);
});