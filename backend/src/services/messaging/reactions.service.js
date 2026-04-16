import { supabase } from "../../services/supabase.service.js";

export async function addReaction(messageId, userId, emoji) {
  console.log("addReaction", messageId, userId, emoji);

  const { data, error } = await supabase
    .from("message_reactions")
    .insert({
      message_id: messageId,
      user_id: userId,
      emoji
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function removeReaction(messageId, userId, emoji) {
  console.log("removeReaction", messageId, userId, emoji);

  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .match({
      message_id: messageId,
      user_id: userId,
      emoji
    });

  if (error) throw error;

  return true;
}

export async function toggleReaction(messageId, userId, emoji) {
  console.log("toggleReaction", messageId, userId, emoji);

  const { data: existing, error: fetchError } = await supabase
    .from("message_reactions")
    .select("*")
    .match({
      message_id: messageId,
      user_id: userId,
      emoji
    })
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    await removeReaction(messageId, userId, emoji);
    return { action: "removed" };
  }

  const reaction = await addReaction(messageId, userId, emoji);
  return { action: "added", reaction };
}

export async function getReactionsByMessage(messageId) {
  console.log("getReactionsByMessage", messageId);

  const { data, error } = await supabase
    .from("message_reactions")
    .select(`
      id,
      emoji,
      created_at,
      user:users (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("message_id", messageId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}

export async function getReactionCounts(messageId) {
  console.log("getReactionCounts", messageId);

  const { data, error } = await supabase
    .from("message_reactions")
    .select("emoji")
    .eq("message_id", messageId);

  if (error) throw error;

  const counts = {};
  for (const r of data) {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
  }

  return counts;
}

export async function getReactionsByMessageWithCounts(messageId) {
  console.log("getReactionsByMessageWithCounts", messageId);

  const [reactions, counts] = await Promise.all([
    getReactionsByMessage(messageId),
    getReactionCounts(messageId)
  ]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    reactions,
    counts,
    total
  };
}

export async function getUserReactionForMessage(messageId, userId) {
  console.log("getUserReactionForMessage", messageId, userId);

  const { data, error } = await supabase
    .from("message_reactions")
    .select("*")
    .match({
      message_id: messageId,
      user_id: userId
    })
    .maybeSingle();

  if (error) throw error;

  return data;
}
