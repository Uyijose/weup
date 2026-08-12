import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

console.log(
  "ENV loaded:",
  process.env.SUPABASE_URL ? "yes" : "no"
);

/* -------------------------------------------------
   Supabase
   SERVICE ROLE = bypass RLS
-------------------------------------------------- */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* -------------------------------------------------
   Output file
-------------------------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "json");

const outputFile = path.join(
  outputDir,
  "notificationsReport.json"
);

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */

const ensureOutputDirectory = () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {
      recursive: true,
    });
  }
};

/* -------------------------------------------------
   Main
-------------------------------------------------- */

const run = async () => {
  console.log("Generating notifications report...");

  ensureOutputDirectory();

  /* ---------------- FETCH NOTIFICATIONS ---------------- */

  const {
    data: notifications,
    error: notificationsError,
  } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (notificationsError) {
    console.error(
      "Failed to fetch notifications:",
      notificationsError
    );

    process.exit(1);
  }

  console.log(
    "Notifications found:",
    notifications?.length ?? 0
  );

  /* ---------------- FETCH USERS ---------------- */

  const userIds = [
    ...new Set(
      (notifications || [])
        .flatMap((notification) => [
          notification.recipient_id,
          notification.actor_id,
        ])
        .filter(Boolean)
    ),
  ];

  let users = [];

  if (userIds.length > 0) {
    const {
      data: usersData,
      error: usersError,
    } = await supabase
      .from("users")
      .select(
        "id,username,full_name,avatar_url,is_creator,creator_username"
      )
      .in("id", userIds);

    if (usersError) {
      console.error(
        "Failed to fetch notification users:",
        usersError
      );

      process.exit(1);
    }

    users = usersData || [];
  }

  /* ---------------- CREATE USER MAP ---------------- */

  const userMap = new Map(
    users.map((user) => [
      user.id,
      user,
    ])
  );

  /* ---------------- FORMAT NOTIFICATIONS ---------------- */

  const formattedNotifications = (
    notifications || []
  ).map((notification) => {
    const recipient =
      userMap.get(notification.recipient_id) || null;

    const actor =
      userMap.get(notification.actor_id) || null;

    return {
      ...notification,

      recipient: recipient
        ? {
            id: recipient.id,
            username: recipient.username,
            full_name: recipient.full_name,
            avatar_url: recipient.avatar_url,
            is_creator: recipient.is_creator,
            creator_username:
              recipient.creator_username,
          }
        : null,

      actor: actor
        ? {
            id: actor.id,
            username: actor.username,
            full_name: actor.full_name,
            avatar_url: actor.avatar_url,
            is_creator: actor.is_creator,
            creator_username:
              actor.creator_username,
          }
        : null,
    };
  });

  /* ---------------- STATISTICS ---------------- */

  const unreadNotifications =
    formattedNotifications.filter(
      (notification) => !notification.read
    );

  const readNotifications =
    formattedNotifications.filter(
      (notification) => notification.read
    );

  const notificationsByType =
    formattedNotifications.reduce(
      (result, notification) => {
        const type =
          notification.type || "unknown";

        result[type] =
          (result[type] || 0) + 1;

        return result;
      },
      {}
    );

  const notificationsByRecipient =
    formattedNotifications.reduce(
      (result, notification) => {
        const recipientId =
          notification.recipient_id;

        if (!result[recipientId]) {
          result[recipientId] = {
            user: userMap.get(recipientId) || null,
            total: 0,
            unread: 0,
            read: 0,
          };
        }

        result[recipientId].total += 1;

        if (notification.read) {
          result[recipientId].read += 1;
        } else {
          result[recipientId].unread += 1;
        }

        return result;
      },
      {}
    );

  /* ---------------- REPORT ---------------- */

  const report = {
    generatedAt: new Date().toISOString(),

    summary: {
      totalNotifications:
        formattedNotifications.length,

      unreadNotifications:
        unreadNotifications.length,

      readNotifications:
        readNotifications.length,

      totalUsersInvolved:
        userIds.length,

      notificationTypes:
        notificationsByType,
    },

    notificationsByRecipient,

    notifications:
      formattedNotifications,
  };

  /* ---------------- WRITE JSON ---------------- */

  fs.writeFileSync(
    outputFile,
    JSON.stringify(
      report,
      null,
      2
    ),
    "utf8"
  );

  console.log(
    "Notifications report generated successfully."
  );

  console.log(
    "Output:",
    outputFile
  );

  console.log(
    "Total notifications:",
    formattedNotifications.length
  );

  console.log(
    "Unread:",
    unreadNotifications.length
  );

  console.log(
    "Read:",
    readNotifications.length
  );

  console.log(
    "Types:",
    notificationsByType
  );
};

run();