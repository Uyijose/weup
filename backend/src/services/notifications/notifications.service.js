import { supabase } from "../../lib/supabase.js";

/* -------------------------------------------------
   CREATE NOTIFICATION
-------------------------------------------------- */

export async function createNotification({
  recipientId,
  actorId = null,
  type,
  title,
  body,
  referenceId = null,
  referenceType = null,
}) {
  if (!recipientId) {
    throw new Error("Notification recipient is required");
  }

  if (!type) {
    throw new Error("Notification type is required");
  }

  if (!title) {
    throw new Error("Notification title is required");
  }

  if (!body) {
    throw new Error("Notification body is required");
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: recipientId,
      actor_id: actorId,
      type,
      title,
      body,
      reference_id: referenceId,
      reference_type: referenceType,
      read: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* -------------------------------------------------
   LIKE NOTIFICATION
-------------------------------------------------- */

export async function createLikeNotification({
  recipientId,
  actorId,
  postId,
  actorName = "Someone",
}) {
  if (!recipientId || !postId) {
    return null;
  }

  // Don't notify users about their own actions.
  if (recipientId === actorId) {
    return null;
  }

  return createNotification({
    recipientId,
    actorId,
    type: "like",
    title: "New like",
    body: `${actorName} liked your video.`,
    referenceId: postId,
    referenceType: "post",
  });
}

/* -------------------------------------------------
   COMMENT NOTIFICATION
-------------------------------------------------- */

export async function createCommentNotification({
  recipientId,
  actorId,
  postId,
  actorName = "Someone",
}) {
  if (!recipientId || !postId) {
    return null;
  }

  if (recipientId === actorId) {
    return null;
  }

  return createNotification({
    recipientId,
    actorId,
    type: "comment",
    title: "New comment",
    body: `${actorName} commented on your video.`,
    referenceId: postId,
    referenceType: "post",
  });
}

/* -------------------------------------------------
   FOLLOW / SUBSCRIPTION NOTIFICATION
-------------------------------------------------- */

export async function createFollowNotification({
  recipientId,
  actorId,
  actorName = "Someone",
  referenceId = null,
}) {
  if (!recipientId || !actorId) {
    return null;
  }

  if (recipientId === actorId) {
    return null;
  }

  return createNotification({
    recipientId,
    actorId,
    type: "follow",
    title: "New follower",
    body: `${actorName} followed you.`,
    referenceId,
    referenceType: "user",
  });
}

/* -------------------------------------------------
   MESSAGE NOTIFICATION
-------------------------------------------------- */

export async function createMessageNotification({
  recipientId,
  actorId,
  conversationId,
  actorName = "Someone",
}) {
  if (!recipientId || !conversationId) {
    return null;
  }

  if (recipientId === actorId) {
    return null;
  }

  return createNotification({
    recipientId,
    actorId,
    type: "message",
    title: "New message",
    body: `${actorName} sent you a message.`,
    referenceId: conversationId,
    referenceType: "conversation",
  });
}

/* -------------------------------------------------
   SYSTEM NOTIFICATION
-------------------------------------------------- */

export async function createSystemNotification({
  recipientId,
  title,
  body,
  referenceId = null,
  referenceType = null,
}) {
  return createNotification({
    recipientId,
    actorId: null,
    type: "system",
    title,
    body,
    referenceId,
    referenceType,
  });
}

/* -------------------------------------------------
   GET NOTIFICATIONS
-------------------------------------------------- */

export async function getNotifications(
  userId,
  limit = 50
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100
  );

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(safeLimit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

/* -------------------------------------------------
   GET UNREAD COUNT
-------------------------------------------------- */

export async function getUnreadNotificationCount(
  userId
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("recipient_id", userId)
    .eq("read", false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

/* -------------------------------------------------
   MARK ONE AS READ
-------------------------------------------------- */

export async function markNotificationAsRead(
  notificationId,
  userId
) {
  if (!notificationId || !userId) {
    throw new Error(
      "Notification ID and user ID are required"
    );
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({
      read: true,
    })
    .eq("id", notificationId)
    .eq("recipient_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* -------------------------------------------------
   MARK ALL AS READ
-------------------------------------------------- */

export async function markAllNotificationsAsRead(
  userId
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({
      read: true,
    })
    .eq("recipient_id", userId)
    .eq("read", false)
    .select();

  if (error) {
    throw error;
  }

  return data ?? [];
}