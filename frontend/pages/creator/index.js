import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../../utils/supabaseClient";
import Header from "../../components/Header";
import LeftHandSide from "../../components/LeftHandSide";
import avatarFallback from "../../components/assets/avatar-fallback.jpg";

const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const CreatorsList = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const siteTitle = "WeUp - Discover Creators";
  const siteDescription = "Discover top creators and their content on WeUp.";
  const siteUrl = "https://weup-dun.vercel.app/";
  const siteImage = "https://whosup.fun/whosup-icon.PNG";

  useEffect(() => {
    const fetchCreators = async () => {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, creator_username, platform_title, creator_avatar_url, creator_description"
        )
        .eq("is_creator", true)
        .order("creator_views", { ascending: false });

      if (error) {
        console.error("Error fetching creators:", error);
        setCreators([]);
      } else {
        setCreators(data);
      }

      setLoading(false);
    };

    fetchCreators();
  }, []);

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
            <p className="loading-text">Loading creators...</p>
          </div>
        </main>
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div>
        
        <Header mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />

        <main>
          <LeftHandSide
            mobileMenu={mobileMenu}
            setMobileMenu={setMobileMenu}
          />

          <div className="creator-list-container">
            <p className="explore-empty">No creators available yet.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
  <div>
    <Head>
      <title>WeUp - Discover Creators</title>

      <meta name="description" content="Discover top creators and their content on WeUp." />

      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="WeUp - Discover Creators" />
      <meta property="og:description" content="Discover top creators and their content on WeUp." />
      <meta property="og:url" content="https://weup-dun.vercel.app/" />
      <meta property="og:site_name" content="WeUp" />
      <meta property="og:image" content="https://whosup.fun/whosup-icon.PNG" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="WeUp - Discover Creators" />
      <meta name="twitter:description" content="Discover top creators and their content on WeUp." />
      <meta name="twitter:image" content="https://whosup.fun/whosup-icon.PNG" />
    </Head>
      <Header mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />

      <main>
        <LeftHandSide
          mobileMenu={mobileMenu}
          setMobileMenu={setMobileMenu}
        />

        <div className="creator-list-container">
          <h1 className="creator-list-header">Discover Creators</h1>

          <div className="creator-list-grid">
            {creators.map((creator) => (
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

export default CreatorsList;