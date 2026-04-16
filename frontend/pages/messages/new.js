import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMessagesStore } from "../../stores/messagesStore";
import { useAuthStore } from "../../stores/authStore";
import { supabase } from "../../utils/supabaseClient";

export default function NewMessagePage() {
  const router = useRouter();

  const { user } = useAuthStore();
  const { createConversation } = useMessagesStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) return setResults([]);

      const { data, error } = await supabase
        .from("users")
        .select("id, username, full_name, creator_username, creator_avatar_url")
        .or(
            `username.ilike.%${query}%,full_name.ilike.%${query}%,creator_username.ilike.%${query}%`
        );

        console.log("[USER SEARCH - SUPABASE]", {
        query,
        data,
        error,
        count: data?.length
        });

        if (error) {
        console.log("[USER SEARCH ERROR]", error);
        setResults([]);
        return;
        }

        setResults(data || []);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const startChat = async (targetUser) => {
    console.log("[START CHAT]", { user, targetUser });

    if (!user?.id || !targetUser?.id) {
        console.log("[START CHAT FAILED] missing ids");
        return;
    }

    try {
        const res = await createConversation(
        [user.id, targetUser.id],
        false,
        null
        );

        console.log("[START CHAT RESPONSE]", res);

        const id = res?.conversation?.id;

        if (id) {
        console.log("[NAVIGATING TO CONVERSATION]", id);
        router.push(`/messages/${id}`);
        return;
        }

        console.log("[NO CONVERSATION ID RETURNED]");
    } catch (err) {
        console.log("[START CHAT ERROR]", err);

        if (err?.message?.includes("members")) {
        console.log("[FALLBACK] redirecting instead of crash");
        }
    }
    };

  return (
    <div className="new-message-container">
      <h2>New Message</h2>

      <input
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="user-results">
        {query.trim() && results.length === 0 && (
            <div className="empty-state">
            No users found
            </div>
        )}

        {!query.trim() && (
            <div className="empty-state">
            Type to search users
            </div>
        )}

        {results.map((u) => {
            console.log("[USER RESULT RENDER]", u);

            return (
            <div
                key={u.id}
                className="user-item"
                onClick={() => startChat(u)}
            >
                <div className="user-main">
                <div>{u.username || ""}</div>

                <div>{u.full_name || ""}</div>

                <div>{u.creator_username ? `@${u.creator_username}` : ""}</div>
                </div>
            </div>
            );
        })}
        </div>
    </div>
  );
}
