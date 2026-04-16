import { supabase } from "../../services/supabase.service.js";

function validateUUID(id) {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid UUID");
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    throw new Error("Invalid UUID format");
  }
}

export async function createMessage({
  conversation_id,
  sender_id,
  content,
  message_type = "text",
  media_url = null,
  reply_to_message_id = null
}) {
  console.log("createMessage", conversation_id, sender_id);

  validateUUID(conversation_id);
  validateUUID(sender_id);

  if (!content) {
    throw new Error("Message content required");
  }

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("id")
    .match({
      conversation_id,
      user_id: sender_id
    })
    .single();

  if (!membership) {
    throw new Error("User not in conversation");
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id,
      sender_id,
      content,
      message_type,
      media_url,
      reply_to_message_id
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("conversations")
    .update({
      last_message_at: message.created_at
    })
    .eq("id", conversation_id);

  return await getMessageById(message.id);
}

export async function getMessageById(messageId) {
  console.log("getMessageById", messageId);

  validateUUID(messageId);

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:users (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq("id", messageId)
    .single();

  if (error) throw error;

  const reactions = await getReactionsForMessage(messageId);

  return {
    ...data,
    reactions,
    reactions_count: reactions.length
  };
}

export async function getMessagesByConversation(
  conversationId,
  limit = 50,
  offset = 0
) {
  console.log("getMessagesByConversation", conversationId);

  validateUUID(conversationId);

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:users (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const results = [];
  for (const message of data) {
    const reactions = await getReactionsForMessage(message.id);
    results.push({
      ...message,
      reactions,
      reactions_count: reactions.length
    });
  }

  return results.reverse();
}

export async function updateMessage(messageId, updates) {
  console.log("updateMessage", messageId);

  validateUUID(messageId);

  const allowed = {
    content: updates.content,
    media_url: updates.media_url,
    edited: true
  };

  Object.keys(allowed).forEach(
    (k) => allowed[k] === undefined && delete allowed[k]
  );

  const { data, error } = await supabase
    .from("messages")
    .update(allowed)
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;

  return await getMessageById(data.id);
}

export async function deleteMessage(messageId) {
  console.log("deleteMessage", messageId);

  validateUUID(messageId);

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  if (error) throw error;

  return true;
}

export async function markMessageAsRead(messageId, userId) {
  console.log("markMessageAsRead", messageId, userId);

  validateUUID(messageId);
  validateUUID(userId);

  const { data: message } = await supabase
    .from("messages")
    .select("conversation_id")
    .eq("id", messageId)
    .single();

  if (!message) return false;

  const { error } = await supabase
    .from("conversation_members")
    .update({
      last_read_at: new Date().toISOString()
    })
    .match({
      conversation_id: message.conversation_id,
      user_id: userId
    });

  if (error) throw error;

  return true;
}

export async function getUnreadMessages(userId) {
  console.log("getUnreadMessages", userId);

  validateUUID(userId);

  const { data, error } = await supabase
    .from("conversation_members")
    .select(
      `
      conversation_id,
      last_read_at,
      messages:messages (
        *,
        sender:users (
          id,
          username,
          avatar_url
        )
      )
    `
    )
    .eq("user_id", userId);

  if (error) throw error;

  const unread = [];

  for (const row of data) {
    for (const msg of row.messages || []) {
      if (
        msg.sender_id !== userId &&
        (!row.last_read_at ||
          new Date(msg.created_at) > new Date(row.last_read_at))
      ) {
        unread.push(msg);
      }
    }
  }

  return unread;
}

export async function searchMessages(filters, pagination = {}) {
  console.log("searchMessages", filters);

  const { limit = 50, offset = 0 } = pagination;

  let query = supabase
    .from("messages")
    .select(
      `
      *,
      sender:users (
        id,
        username,
        avatar_url
      )
    `
    );

  if (filters.conversation_id) {
    validateUUID(filters.conversation_id);
    query = query.eq("conversation_id", filters.conversation_id);
  }

  if (filters.sender_id) {
    validateUUID(filters.sender_id);
    query = query.eq("sender_id", filters.sender_id);
  }

  if (filters.message_type) {
    query = query.eq("message_type", filters.message_type);
  }

  if (filters.date_from) {
    query = query.gte("created_at", filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte("created_at", filters.date_to);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data;
}

async function getReactionsForMessage(messageId) {
  console.log("getReactionsForMessage", messageId);

  validateUUID(messageId);

  const { data, error } = await supabase
    .from("message_reactions")
    .select(
      `
      id,
      emoji,
      user:users (
        id,
        username,
        avatar_url
      ),
      created_at
    `
    )
    .eq("message_id", messageId);

  if (error) throw error;

  return data;
}

export async function sendMessage(conversationId, senderId, content) {
  console.log("sendMessage wrapper", conversationId, senderId);

  return await createMessage({
    conversation_id: conversationId,
    sender_id: senderId,
    content
  });
}

export async function getMessages(conversationId) {
  console.log("getMessages wrapper", conversationId);

  return await getMessagesByConversation(conversationId, 50, 0);
}

export async function updateMessageByUser(messageId, userId, content) {
  console.log("updateMessageByUser wrapper", messageId, userId);

  const { data } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (!data || data.sender_id !== userId) {
    throw new Error("Message not found or access denied");
  }

  return await updateMessage(messageId, { content });
}

export async function deleteMessageByUser(messageId, userId) {
  console.log("deleteMessageByUser wrapper", messageId, userId);

  const { data } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (!data || data.sender_id !== userId) {
    throw new Error("Message not found or access denied");
  }

  return await deleteMessage(messageId);
}
