import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "next/router";
import { useMessagesStore } from "../../stores/messagesStore";
import { subscribeToConversation, emitTyping } from "../../utils/realtimeChat";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;

  const activeConversation = useMessagesStore((s) => s.activeConversation);

  useEffect(() => {
    console.log("[CHAT HEADER] activeConversation:", activeConversation);
  }, [activeConversation]);


  const {
    messages,
    conversations,
    openConversation,
    loadConversations,
    sendMessage
  } = useMessagesStore();

  const { user } = useAuthStore();

  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [presence, setPresence] = useState({});

  useEffect(() => {
    if (conversations.length === 0) {
      console.log("[CHAT PAGE] loading conversations");
      loadConversations();
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    console.log("[CHAT INIT OPEN]", {
      id,
      conversationsLength: conversations.length
    });

    if (conversations.length === 0) {
      console.log("[CHAT INIT] waiting for conversations first");
      return;
    }

    openConversation(id);
  }, [id, conversations.length]);

  useEffect(() => {
    if (!id || !user?.id) return;

    console.log("[CHAT REALTIME INIT]", id);

    const unsubscribe = subscribeToConversation({
      conversationId: id,
      userId: user.id,
      onMessage: (msg) => {
        console.log("[CHAT LIVE MESSAGE]", msg);
        useMessagesStore.getState().appendMessage(id, msg);
      },
      onTyping: (data) => {
        console.log("[CHAT TYPING EVENT]", data);

        if (data.state === "typing") {
          setTypingUser(data.user_id);
        }

        if (data.state === "stop") {
          setTypingUser(null);
        }
      },
      onPresence: (state) => {
        setPresence(state);
      }
    });

    return () => unsubscribe();
  }, [id, user?.id]);

  const convoMessages = messages[id] || [];

  const conversationTitle =
    activeConversation?.title || "Chat";

  console.log("[CHAT HEADER TITLE]", {
    conversationId: id,
    activeConversation,
    title: conversationTitle
  });

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(id, text);
    setText("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button
          className="chat-back-btn"
          onClick={() => {
            router.back();
          }}
        >
          ←
        </button>
        <div className="chat-title">
          <h2>{conversationTitle}</h2>
          <div className="chat-status">
            {typingUser && "typing..."}
            {!typingUser &&
              Object.values(presence).some(
                (p) => p[0]?.user_id !== user?.id
              ) && "online"}
            {!typingUser &&
              !Object.values(presence).some(
                (p) => p[0]?.user_id !== user?.id
              ) && "offline"}

          </div>
        </div>
      </div>

      <div className="chat-body">
        {convoMessages.map((msg) => {
          const isMe = msg.sender_id === user?.id;

          console.log("[CHAT MSG]", {
            msgId: msg.id,
            sender_id: msg.sender_id,
            myId: user?.id,
            isMe
          });

          return (
            <div
              key={msg.id}
              className={`chat-message ${isMe ? "me" : "other"}`}
            >
              {msg.content}
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTyping(id, user.id);
          }}
          placeholder="Type a message..."
        />

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
