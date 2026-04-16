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

  const { user: authUser, loading: authLoading } = useAuthStore();

  useEffect(() => {
    console.log("[MESSAGES] auth check running", {
      user: authUser,
      loading: authLoading
    });

    if (authLoading) return;

    if (!authUser) {
      console.log("[MESSAGES] no user found → redirecting to login");
      alert("You must be logged in to access Messages");

      router.replace("/auth/signin");
    }
  }, [authUser, authLoading, router]);


  useEffect(() => {
    if (!user) {
      console.log("[MESSAGES] blocked loadConversations - no user");
      return;
    }

    console.log("[MESSAGES] loading conversations for user", user.id);
    loadConversations();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return conversations.filter((c) =>
      c.title?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  if (!authUser) {
    console.log("[MESSAGES] rendering blocked UI - no auth");

    return (
      <div style={{ padding: 20, color: "white", background: "#000", minHeight: "100vh" }}>
        <h2>You must be logged in to view messages</h2>
        <p>Redirecting...</p>
      </div>
    );
  }


  return (
    <div className="messages-container">
      <div className="messages-header">
        <div className="messages-header-left">
          
           <h1
              className="logo-text"
              onClick={() => {
                console.log("[NAVIGATION] go home from logo");
                router.push("/");
              }}
            >
              WeUp
            </h1>

          <h1>Messages</h1>
        </div>

        <button
          className="new-message-btn"
          onClick={() => {
            console.log("[NAVIGATE] NEW MESSAGE");
            router.push("/messages/new");
          }}
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
