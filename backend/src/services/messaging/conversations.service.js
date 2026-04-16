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

export async function createConversation({
  creator_id,
  member_ids,
  is_group = false,
  title = null
}) {
  console.log("createConversation", creator_id, member_ids);

  if (!Array.isArray(member_ids) || member_ids.length === 0) {
    throw new Error("Conversation must have members");
  }

  const allMembers = [...new Set([creator_id, ...member_ids])];

  if (!is_group && allMembers.length === 2) {
    const { data: existing } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .in("user_id", allMembers);

    if (existing && existing.length === 2) {
      const convoId = existing[0].conversation_id;
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", convoId)
        .single();

      if (data) return data;
    }
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      is_group,
      title
    })
    .select()
    .single();

  if (error) throw error;

  const membersPayload = allMembers.map((id) => ({
    conversation_id: conversation.id,
    user_id: id
  }));

  const { error: membersError } = await supabase
    .from("conversation_members")
    .insert(membersPayload);

  if (membersError) throw membersError;

  return conversation;
}

export async function getConversationById(conversationId) {
  console.log("getConversationById", conversationId);

  validateUUID(conversationId);

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) throw error;

  return data;
}

export async function getUserConversations(userId) {
  console.log("getUserConversations", userId);

  validateUUID(userId);

  const { data, error } = await supabase
    .from("conversation_members")
    .select(
      `
      conversation:conversations (
        *,
        members:conversation_members (
          user_id,
          last_read_at,
          user:users (
            id,
            username,
            avatar_url
          )
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("conversation.last_message_at", { ascending: false });

  if (error) throw error;

  return data.map((r) => r.conversation);
}

export async function addMemberToConversation(conversationId, userId) {
  console.log("addMemberToConversation", conversationId, userId);

  validateUUID(conversationId);
  validateUUID(userId);

  const { error } = await supabase
    .from("conversation_members")
    .insert({
      conversation_id: conversationId,
      user_id: userId
    });

  if (error && !error.message.includes("duplicate")) {
    throw error;
  }

  return true;
}

export async function removeMemberFromConversation(conversationId, userId) {
  console.log("removeMemberFromConversation", conversationId, userId);

  validateUUID(conversationId);
  validateUUID(userId);

  const { error } = await supabase
    .from("conversation_members")
    .delete()
    .match({
      conversation_id: conversationId,
      user_id: userId
    });

  if (error) throw error;

  return true;
}

export async function markConversationAsRead(conversationId, userId) {
  console.log("markConversationAsRead", conversationId, userId);

  validateUUID(conversationId);
  validateUUID(userId);

  const { error } = await supabase
    .from("conversation_members")
    .update({
      last_read_at: new Date().toISOString()
    })
    .match({
      conversation_id: conversationId,
      user_id: userId
    });

  if (error) throw error;

  return true;
}

export async function getUnreadConversations(userId) {
  console.log("getUnreadConversations", userId);

  validateUUID(userId);

  const { data, error } = await supabase
    .from("conversation_members")
    .select(
      `
      conversation:conversations (
        *,
        messages:messages (
          created_at
        )
      ),
      last_read_at
    `
    )
    .eq("user_id", userId);

  if (error) throw error;

  return data
    .filter((row) => {
      if (!row.last_read_at) return true;
      const lastMessage = row.conversation.messages?.at(-1);
      if (!lastMessage) return false;
      return new Date(lastMessage.created_at) > new Date(row.last_read_at);
    })
    .map((row) => row.conversation);
}

export async function updateConversation(conversationId, updates) {
  console.log("updateConversation", conversationId, updates);

  validateUUID(conversationId);

  const allowed = {
    title: updates.title,
    is_group: updates.is_group
  };

  Object.keys(allowed).forEach(
    (k) => allowed[k] === undefined && delete allowed[k]
  );

  const { data, error } = await supabase
    .from("conversations")
    .update(allowed)
    .eq("id", conversationId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteConversation(conversationId) {
  console.log("deleteConversation", conversationId);

  validateUUID(conversationId);

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) throw error;

  return true;
}
