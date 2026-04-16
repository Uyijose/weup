import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMessagesStore } from "../../stores/messagesStore";
import "../../components/styles/Chat.css";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    messages,
    openConversation,
    sendMessage
  } = useMessagesStore();

  const [text, setText] = useState("");

  useEffect(() => {
    if (id) openConversation(id);
  }, [id]);

  const convoMessages = messages[id] || [];

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(id, text);
    setText("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => router.back()}>
          ←
        </button>
        <h2>Conversation</h2>
      </div>

      <div className="chat-body">
        {convoMessages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.isMe ? "me" : "other"
            }`}
          >
            {msg.content}
          </div>
        ))}
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
