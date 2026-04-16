import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMessagesStore } from "../../stores/messagesStore";
import { useAuthStore } from "../../stores/authStore";

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createConversation } = useMessagesStore();

  const {
    conversations,
    loadConversations
  } = useMessagesStore();

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return conversations.filter((c) =>
      c.title?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>Messages</h1>

        <button
          className="new-message-btn"
          onClick={() => router.push("/messages/new")}
        >
          + New
        </button>
      </div>

      <input
        className="messages-search"
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="messages-list">
        {filtered.map((conv) => (
          <div
            key={conv.id}
            className="conversation-item"
            onClick={() =>
              router.push(`/messages/${conv.id}`)
            }
          >
            <div className="conversation-title">
              {conv.title || "Chat"}
            </div>

            <div className="conversation-meta">
              {conv.last_message || "No messages yet"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
