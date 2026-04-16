import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "next/router";
import { useMessagesStore } from "../../stores/messagesStore";

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
    sendMessage
  } = useMessagesStore();

  const { user } = useAuthStore();

  const [text, setText] = useState("");

  useEffect(() => {
    if (id) openConversation(id);
  }, [id]);

  const convoMessages = messages[id] || [];

  const conversation = conversations.find(
    (c) => c.id === id
  );

  const conversationTitle = conversation?.title || "Chat";

  console.log("[CHAT HEADER TITLE]", {
    conversationId: id,
    conversation,
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
        <h2>{conversationTitle} </h2>
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
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
