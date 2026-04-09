import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import Header from "../../components/Header";
import LeftHandSide from "../../components/LeftHandSide";
import avatarFallback from "../../components/assets/avatar-fallback.jpg";

const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const SubscriptionsPage = () => {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const fetchUserAndSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;

      if (!currentUser) {
        router.push("/auth/signin");
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          creator_id,
          users:creator_id (
            id,
            creator_username,
            platform_title,
            creator_avatar_url,
            creator_description
          )
        `)
        .eq("subscriber_id", currentUser.id);

      if (error) {
        console.error("Error fetching subscriptions:", error);
        setSubscriptions([]);
      } else {
        const formatted = data.map((item) => item.users);
        setSubscriptions(formatted);
      }

      setLoading(false);
    };

    fetchUserAndSubscriptions();
  }, [router]);

  if (loading) {
    return (
      <div>
        <Header mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />

        <main>
          <LeftHandSide
            mobileMenu={mobileMenu}
            setMobileMenu={setMobileMenu}
          />

          <div className="creator-list-container">
            <p className="loading-text">Loading subscriptions...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div>
        <Header mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />

        <main>
          <LeftHandSide
            mobileMenu={mobileMenu}
            setMobileMenu={setMobileMenu}
          />

          <div className="creator-list-container">
            <p className="explore-empty">
              You are not subscribed to any creators yet.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />

      <main>
        <LeftHandSide
          mobileMenu={mobileMenu}
          setMobileMenu={setMobileMenu}
        />

        <div className="creator-list-container">
          <h1 className="creator-list-header">Your Subscriptions</h1>

          <div className="creator-list-grid">
            {subscriptions.map((creator) => (
              <div
                key={creator.id}
                className="creator-card"
                onClick={() =>
                  router.push(`/creator/${creator.creator_username}`)
                }
              >
                <img
                  src={creator.creator_avatar_url || avatarFallback.src}
                  alt={creator.creator_username}
                  className="creator-avatar"
                />

                <div className="creator-info">
                  <h3 className="creator-platform-title">
                    {truncateText(creator.platform_title, 20)}
                  </h3>

                  <p className="creator-username">
                    @{truncateText(creator.creator_username, 20)}
                  </p>

                  <p className="creator-description">
                    {truncateText(creator.creator_description, 50)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionsPage;