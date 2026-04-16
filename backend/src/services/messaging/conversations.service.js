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
      .select("conversation_id, user_id")
      .in("user_id", allMembers);

    const grouped = {};

    for (const row of existing || []) {
      if (!grouped[row.conversation_id]) {
        grouped[row.conversation_id] = new Set();
      }
      grouped[row.conversation_id].add(row.user_id);
    }

    for (const [conversationId, membersSet] of Object.entries(grouped)) {
      const hasAll = allMembers.every((id) => membersSet.has(id));

      if (hasAll && membersSet.size === allMembers.length) {
        const { data } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        if (data) {
          console.log("[EXISTING CONVERSATION FOUND]", conversationId);
          return data;
        }
      }
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

  console.log("[CONVERSATIONS] fetching for userId:", userId);

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
    .eq("user_id", userId);

  console.log("[CONVERSATIONS] raw response:", data);
  console.log("[CONVERSATIONS] error:", error);

  if (error) throw error;

  console.log("[CONVERSATIONS] building enriched conversations");

  const currentUserId = userId;

  const convoIds = data.map((r) => r.conversation.id);

const { data: messages } = await supabase
  .from("messages")
  .select("id, conversation_id, content, created_at")
  .in("conversation_id", convoIds)
  .order("created_at", { ascending: false });

const grouped = {};

for (const msg of messages || []) {
  if (!grouped[msg.conversation_id]) {
    grouped[msg.conversation_id] = msg;
  }
}

const enriched = data.map((r) => {
  const convo = r.conversation;

  const members = convo.members || [];

  const otherMembers = members
    .filter(m => m.user_id !== userId)
    .map(m => m.user)
    .filter(Boolean);

  let displayTitle = convo.title;

  if (!convo.is_group) {
    const otherUser = otherMembers[0];

    displayTitle =
      otherUser?.full_name ||
      otherUser?.username ||
      "Unknown User";
  }

  const lastMessage = grouped[convo.id];

  return {
    id: convo.id,
    is_group: convo.is_group,
    created_at: convo.created_at,
    last_message_at: lastMessage?.created_at || null,
    last_message: lastMessage?.content || null,
    title: displayTitle,
    raw_title: convo.title,
    members
  };
});

const sorted = enriched.sort((a, b) => {
  const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
  const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;

  return bTime - aTime;
});

return sorted;
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
