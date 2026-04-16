import { supabase } from "./supabaseClient";

let messageChannel = null;
let typingChannel = null;
let presenceChannel = null;

export function subscribeToConversation({
  conversationId,
  userId,
  onMessage,
  onTyping,
  onPresence
}) {
  console.log("[REALTIME] subscribing:", conversationId);

  messageChannel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log("[REALTIME MESSAGE]", payload.new);
        onMessage(payload.new);
      }
    )
    .subscribe();

  typingChannel = supabase.channel(
    `typing:${conversationId}`,
    { config: { broadcast: { self: false } } }
  );

  typingChannel
    .on("broadcast", { event: "typing" }, (payload) => {
      console.log("[REALTIME TYPING]", payload.payload);
      onTyping(payload.payload);
    })
    .subscribe();

  presenceChannel = supabase.channel(
    `presence:${conversationId}`,
    {
      config: { presence: { key: conversationId } }
    }
  );

  presenceChannel
    .on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();
      console.log("[REALTIME PRESENCE]", state);
      onPresence(state);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({
          user_id: userId,
          online_at: new Date().toISOString()
        });
      }
    });

  return () => {
    console.log("[REALTIME] unsubscribing:", conversationId);
    supabase.removeChannel(messageChannel);
    supabase.removeChannel(typingChannel);
    supabase.removeChannel(presenceChannel);
  };
}

export function emitTyping(conversationId, userId, state) {
  if (!typingChannel) return;

  typingChannel.send({
    type: "broadcast",
    event: "typing",
    payload: {
      user_id: userId,
      state
    }
  });

  console.log("[TYPING EMIT]", { conversationId, state });
}
