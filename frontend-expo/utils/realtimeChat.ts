import { supabase } from "../lib/supabase";

type TypingPayload = {
  user_id: string;
  state: "typing" | "stop";
};

type PresenceState = Record<
  string,
  Array<{
    user_id?: string;
    online?: boolean;
    last_seen?: string;
  }>
>;

type SubscribeToConversationParams = {
  conversationId: string;
  userId: string;
  onMessage?: (message: Record<string, unknown>) => void;
  onTyping?: (data: TypingPayload) => void;
  onPresence?: (state: PresenceState) => void;
};

let typingChannel: ReturnType<typeof supabase.channel> | null = null;
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export function subscribeToConversation({
  conversationId,
  userId,
  onMessage,
  onTyping,
  onPresence,
}: SubscribeToConversationParams) {
  console.log("[REALTIME] subscribing:", conversationId);

  /*
   * MESSAGE CHANNEL
   */
  const messageChannel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log("[REALTIME MESSAGE]", payload.new);

        onMessage?.(
          payload.new as Record<string, unknown>
        );
      }
    )
    .subscribe((status) => {
      console.log(
        "[REALTIME MESSAGE CHANNEL STATUS]",
        conversationId,
        status
      );
    });

  /*
   * TYPING CHANNEL
   */
  const currentTypingChannel = supabase.channel(
    `typing:${conversationId}`,
    {
      config: {
        broadcast: {
          self: false,
        },
      },
    }
  );

  typingChannel = currentTypingChannel;

  currentTypingChannel
    .on(
      "broadcast",
      {
        event: "typing",
      },
      (payload) => {
        console.log(
          "[REALTIME TYPING]",
          payload.payload
        );

        onTyping?.(
          payload.payload as TypingPayload
        );
      }
    )
    .subscribe((status) => {
      console.log(
        "[REALTIME TYPING CHANNEL STATUS]",
        conversationId,
        status
      );
    });

  /*
   * PRESENCE CHANNEL
   */
  const presenceChannel = supabase.channel(
    `presence:${conversationId}`,
    {
      config: {
        presence: {
          key: userId,
        },
      },
    }
  );

  presenceChannel
    .on(
      "presence",
      {
        event: "sync",
      },
      () => {
        const state =
          presenceChannel.presenceState() as PresenceState;

        console.log(
          "[REALTIME PRESENCE]",
          state
        );

        onPresence?.(state);
      }
    )
    .subscribe(async (status) => {
      console.log(
        "[REALTIME PRESENCE CHANNEL STATUS]",
        conversationId,
        status
      );

      if (status !== "SUBSCRIBED") {
        return;
      }

      console.log(
        "[PRESENCE JOIN]",
        userId
      );

      /*
       * Supabase's current TypeScript definition
       * returns a status value from track(), not
       * an object containing { error }.
       */
      try {
        const trackStatus =
          await presenceChannel.track({
            user_id: userId,
            online: true,
            last_seen:
              new Date().toISOString(),
          });

        console.log(
          "[PRESENCE TRACK STATUS]",
          trackStatus
        );
      } catch (error) {
        console.log(
          "[PRESENCE TRACK ERROR]",
          error
        );
      }
    });

  /*
   * CLEANUP
   */
  return () => {
    console.log(
      "[REALTIME] unsubscribing:",
      conversationId
    );

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }

    if (
      typingChannel ===
      currentTypingChannel
    ) {
      typingChannel = null;
    }

    void supabase.removeChannel(
      messageChannel
    );

    void supabase.removeChannel(
      currentTypingChannel
    );

    void supabase.removeChannel(
      presenceChannel
    );
  };
}

/*
 * TYPING INDICATOR
 */
export function emitTyping(
  conversationId: string,
  userId: string
): void {
  if (!typingChannel) {
    console.log(
      "[TYPING] No active typing channel",
      conversationId
    );

    return;
  }

  /*
   * Only send "typing" once until the timeout
   * is restarted.
   */
  if (!typingTimeout) {
    void typingChannel
      .send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: userId,
          state: "typing",
        },
      })
      .then((status) => {
        console.log(
          "[TYPING START STATUS]",
          status
        );
      })
      .catch((error) => {
        console.log(
          "[TYPING START ERROR]",
          error
        );
      });

    console.log(
      "[TYPING START]",
      userId
    );
  }

  /*
   * Reset the timeout every time the user
   * types another character.
   */
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    if (!typingChannel) {
      typingTimeout = null;
      return;
    }

    void typingChannel
      .send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: userId,
          state: "stop",
        },
      })
      .then((status) => {
        console.log(
          "[TYPING STOP STATUS]",
          status
        );
      })
      .catch((error) => {
        console.log(
          "[TYPING STOP ERROR]",
          error
        );
      });

    console.log(
      "[TYPING STOP]",
      userId
    );

    typingTimeout = null;
  }, 5000);
}