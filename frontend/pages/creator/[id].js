import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import Header from "../../components/Header";
import avatarFallback from "../../components/assets/avatar-fallback.jpg";
import LeftHandSide from "../../components/LeftHandSide";


const CreatorProfile = ({ creatorData: initialCreatorData, videos }) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const [authUser, setAuthUser] = useState(null);
  const [videosState, setVideosState] = useState(() => videos || []);
  const [creatorData, setCreatorData] = useState(() => initialCreatorData);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    setCreatorData(initialCreatorData);
  }, [initialCreatorData]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthUser(data.session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (!authUser || !creatorData) return;

    const checkSubscription = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("subscriber_id", authUser.id)
        .eq("creator_id", creatorData.id)
        .maybeSingle();
      setIsSubscribed(!!data);
    };

    checkSubscription();
  }, [authUser, creatorData]);

  const handleSubscribe = async () => {
    if (!authUser) {
      alert("Please login first");
      return;
    }

    if (authUser.id === creatorData.id) return;

    setLoadingSub(true);

    if (isSubscribed) {
      await supabase
        .from("subscriptions")
        .delete()
        .eq("subscriber_id", authUser.id)
        .eq("creator_id", creatorData.id);

      setCreatorData(prev => ({
        ...prev,
        subscribers_count: prev.subscribers_count - 1
      }));

      setIsSubscribed(false);
    } else {
      await supabase
        .from("subscriptions")
        .insert({
          subscriber_id: authUser.id,
          creator_id: creatorData.id
        });

      setCreatorData(prev => ({
        ...prev,
        subscribers_count: prev.subscribers_count + 1
      }));

      setIsSubscribed(true);
    }

    setLoadingSub(false);
  };

  const handleDelete = async (videoId) => {
    if (!authUser) return;;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/videos/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: videoId, user_id: authUser.id }),
    });

    const data = await res.json();
      if (data.success) {
        setVideosState(prev => prev.filter(v => v.id !== videoId));
      } else {
        alert("Failed to delete video");
      }
    };

  if (!creatorData) return <p>Loading...</p>;

return (
  <div className="creator-page-wrapper">
    <Head>
      <title>
        {creatorData
          ? `${creatorData.platform_title?.slice(0, 35)}${creatorData.platform_title && creatorData.platform_title.length > 35 ? "..." : ""} | WeUp`
          : "WeUp"}
      </title>

      <meta
        name="description"
        content={creatorData?.creator_description || "Watch and subscribe to creators on WeUp."}
      />
      
      <link
        rel="canonical"
        href={`https://whosup.fun/creator/${creatorData?.creator_username}`}
      />
      <meta name="robots" content="index, follow" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={creatorData?.platform_title || "WeUp"} />
      <meta property="og:description" content={creatorData?.creator_description || "Watch and subscribe to creators on WeUp."} />
      <meta property="og:url" content={`https://whosup.fun/creator/${creatorData?.creator_username}`} />
      <meta property="og:image:alt" content={creatorData?.platform_title || "WeUp creator"} />
      <meta property="og:site_name" content="WeUp" />
      <meta
        property="og:image"
        content={creatorData?.creator_avatar_url || "https://whosup.fun/default-preview.jpg"}
      />

      <meta
        property="og:image:secure_url"
        content={creatorData?.creator_avatar_url || "https://whosup.fun/default-preview.jpg"}
      />

      <meta property="og:image:type" content="image/jpeg" />

      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={creatorData?.platform_title || "WeUp"} />
      <meta name="twitter:description" content={creatorData?.creator_description || "Watch and subscribe to creators on WeUp."} />
      <meta name="twitter:image" content={creatorData?.creator_avatar_url || "https://whosup.fun/default-preview.jpg"} />
      <meta name="twitter:image:src" content={creatorData?.creator_avatar_url} />

      <link
        rel="icon"
        href="https://th.bing.com/th/id/R.67bc88bb600a54112e8a669a30121273?rik=vsc22vMfmcSGfg&pid=ImgRaw&r=0"
      />
    </Head>
    <Header
      isOwner={true}
      mobileMenu={mobileMenu}
      setMobileMenu={setMobileMenu}
    />
    <main>
      <LeftHandSide
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

        <div className="creator-profile-container">

          <div className="creator-hero">
            <div className="creator-hero-left">
              <div
                className="creator-avatar-large"
                style={{
                  backgroundImage: `url(${creatorData.creator_avatar_url || avatarFallback.src})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
              <div className="creator-hero-info">
                <h2>{creatorData.platform_title}</h2>
                <p>@{creatorData.creator_username}</p>
              </div>
            </div>

            {authUser && authUser.id !== creatorData.id && (
              <button
                onClick={handleSubscribe}
                disabled={loadingSub}
                className={`subscribe-btn ${isSubscribed ? "subscribed" : ""}`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>

          <div className="creator-description-box">
            <h4 className="creator-description-title">Creator Description</h4>
            <p className="creator-description-text">
              {creatorData.creator_description || "No description added yet."}
            </p>
          </div>

          <div className="creator-stats">
            <div>
              <h3>{videos.length}</h3>
              <span>Videos</span>
            </div>
            <div>
              <h3>{creatorData.subscribers_count || 0}</h3>
              <span>Subscribers</span>
            </div>
            <div>
              <h3>{creatorData.creator_views || 0}</h3>
              <span>Views</span>
            </div>
            <div>
              <h3 className="wup-value">
                <span className="wup-symbol">W</span>
                {creatorData.wup_amount || 0}
              </h3>
              <span>WUP</span>
            </div>
          </div>

          <h3 className="creator-section-title">Uploaded Videos</h3>

          <div className="creator-videos">
            {videos.length === 0 ? (
              <div className="empty-creator">
                <h3>No videos uploaded yet</h3>
              </div>
            ) : (
              videosState.slice(0, 16).map((video, index) => {
            
                return (
                  <div key={video.id} className="creator-video-wrapper">
                    <video
                      src={video.video_url}
                      className="creator-video-thumbnail no-download-video"
                      playsInline
                      preload="metadata"
                      controls={false}
                      disablePictureInPicture
                      controlsList="nodownload noplaybackrate nofullscreen"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        console.log("[VIDEO CONTEXT MENU BLOCKED]", video.id);
                      }}
                      onDragStart={(e) => {
                        e.preventDefault();
                        console.log("[VIDEO DRAG BLOCKED]", video.id);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("[VIDEO CLICK IGNORED - USE BUTTON]", video.id);
                      }}
                    />
                    <div
                      className="video-play-button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const hasParts = Array.isArray(video.video_parts) && video.video_parts.length > 0;

                        const route = hasParts
                          ? `/posts/${video.id}?part=1&feed=creator&creator=${creatorData.id}`
                          : `/posts/${video.id}?feed=creator&creator=${creatorData.id}`;

                        console.log("[CREATOR NAVIGATION FIX]", {
                          videoId: video.id,
                          hasParts,
                          route
                        });

                        console.log("[CREATOR VIDEO CLICK -> NAVIGATE FIXED]", {
                          videoId: video.id,
                          creatorId: creatorData.id,
                          route
                        });

                        window.location.href = route;
                      }}
                    >
                      ▶
                    </div>

                    <div className="video-caption">
                      {(() => {
                        const caption = video.caption || "No caption";
                        return caption.length > 15
                          ? caption.slice(0, 15) + "..."
                          : caption;
                      })()}
                    </div>

                    {authUser?.id === creatorData.id && (
                      <div
                        className="video-delete-btn"
                        onClick={() => {
                          const confirmDelete = confirm("Delete this video?");
                          if (confirmDelete) handleDelete(video.id);
                        }}
                      >
                        ⋮
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {videos.length > 16 && (
            <div className="creator-view-more-wrapper">
              <button
                className="creator-view-more-btn"
                onClick={() => {
                  router.push(
                    `/creator/${creatorData.creator_username}/videos`
                  );
                }}
              >
                View All Videos ({videos.length})
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export async function getServerSideProps({ params }) {
  const { data: creator, error } = await supabase
    .from("users")
    .select("*")
    .eq("creator_username", params.id)
    .single();

  if (error || !creator || !creator.is_creator) {
    return { notFound: true };
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      video_parts (
        id,
        post_id,
        part_number,
        video_url,
        likes_count,
        comments_count,
        views_count,
        created_at,
        user_id
      )
    `)
    .eq("user_id", creator.id)
    .order("created_at", { ascending: false });
  return {
    props: {
      creatorData: creator,
      videos: posts || [],
    },
  };
}

export default CreatorProfile;