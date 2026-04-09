import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";

const SubscribersPage = () => {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          subscriber_id,
          users:subscriber_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setSubscribers(data || []);
      }

      setLoading(false);
    };

    fetchSubscribers();
  }, []);

  if (loading) {
    return <div className="subscribers-page">Loading...</div>;
  }

  return (
    <div className="subscribers-page">
      <h2>Your Subscribers</h2>

      {subscribers.length === 0 ? (
        <p>No subscribers yet</p>
      ) : (
        <div className="subscribers-list">
          {subscribers.map((item) => (
            <div
              key={item.subscriber_id}
              className="subscriber-row"
              onClick={() => router.push(`/user/${item.users.id}`)}
            >
              <img
                src={item.users.avatar_url}
                alt={item.users.username}
              />
              <span>@{item.users.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscribersPage;
