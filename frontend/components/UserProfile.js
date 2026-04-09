import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import avatarFallback from "./assets/avatar-fallback.jpg";
import VideoModal from "./VideoModal";
import BecomeCreatorModal from "./BecomeCreatorModal";
import { useAuthStore } from "../stores/authStore";
import { useUsersStore } from "../stores/usersStore";
import { useWatchedHistoryStore } from "../stores/watchedHistoryStore";

const UserProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  const authUser = useAuthStore(state => state.user);
  const hydrateAuth = useAuthStore(state => state.hydrateAuth);
  const fetchUserById = useUsersStore(state => state.fetchUserById);
  const userData = useUsersStore(state => state.usersMap[router.query.id]);
  const watchedVideos = useWatchedHistoryStore(state => state.watchedVideos);
  const fetchWatchedHistory = useWatchedHistoryStore(state => state.fetchWatchedHistory);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const isAdmin = authUser?.is_admin === true;
  const isOwner = authUser && userData && String(authUser.id) === String(userData.id);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [pageVideos, setPageVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 16;
  

  useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setPageVideos(watchedVideos.slice(start, end));
  }, [currentPage, watchedVideos]);

  const totalPages = Math.ceil(watchedVideos.length / PAGE_SIZE);

  
  useEffect(() => {
    if (authUser && userData && !isOwner && !isAdmin) {
      console.log("Unauthorized access attempt:", {
        profileId: userData.id,
        authUser: authUser.id
      });
      alert("You can't view another user's page.");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, [authUser, userData, isOwner, isAdmin]);

  useEffect(() => {
    hydrateAuth();
  }, []);

  useEffect(() => {
    if (!router.query.id) return;
    fetchUserById(router.query.id);
  }, [router.query.id]);
  console.log("UserProfile render:", {
    profileId: router.query.id,
    authUser: authUser?.id,
    isOwner,
    isAdmin
  });

  useEffect(() => {
    if (!userData?.id) return;
    fetchWatchedHistory(userData.id);
  }, [userData?.id]);


  if (!userData) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="user-profile-container"
    >
    <div className="user-avatar-section">
    <div
      className="user-avatar"
      style={{
        backgroundImage: `url(${userData.avatar_url || avatarFallback.src})`,
      }}
    ></div>
    <span>@{userData.username}</span>

      <div className="user-stats">
        <div className="flex flex-col items-center">
          <span className="font-bold">
            {watchedVideos.length}
          </span>
          <span>Videos Watched</span>
        </div>

        <div
          className="flex flex-col items-center"
          onClick={() => router.push("/subscriptions")}
        >
          <span className="font-bold">
            {isOwner ? userData.subscriptions_count || 0 : "0"}
          </span>
          <span>Subscriptions</span>
        </div>
      </div>

      <div className="profile-buttons-row">
        {isAdmin && (
          <button
            className="admin-btn"
            onClick={() => {
              console.log("Admin accessing dashboard");
              router.push("/admin/dashboard");
            }}
          >
            Admin Panel
          </button>
        )}
        {isOwner && (
          <button
            className="user-edit-btn"
            onClick={() => {
              console.log("Owner editing profile");
              router.push(`/profile/edit`);
            }}
          >
            Edit profile
          </button>
        )}
        {userData.is_creator && userData.creator_username && (
          <button
            className="creator-btn"
            onClick={() => {
              console.log("Accessing creator page");
              router.push(`/creator/${userData.creator_username}`);
            }}
          >
            Creator Page
          </button>
        )}
      </div>

    </div>
    
    <h3 className="section-title">Watched History</h3>
    <div className="user-posts">
      {watchedVideos.length === 0 ? (
        <div className="empty-posts-box">
          <h3>
            {isOwner
              ? "You haven't watched any videos yet."
              : "This user hasn't watched any videos yet."}
          </h3>

          {isOwner && (
            <button
              className="empty-upload-btn"
              onClick={() => router.push("/explore")}
            >
              Start Watching
            </button>
          )}
        </div>
      ) : (
        <>
          {pageVideos.map((video, index) => (
            <div key={video.id} className="user-watched-video-wrapper">
              <video
                src={video.video_url}
                className="user-watched-video no-download-video"
                playsInline
                preload="metadata"
                controls={false}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate nofullscreen"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onClick={() => {
                  console.log("OPEN MODAL VIDEO", video.id);
                  setSelectedVideo(video);
                }}
              />
              <div className="user-video-caption">
                {(() => {
                  const caption = video.caption || "No caption available";
                  console.log("USER VIDEO CAPTION:", { id: video.id, caption });
                  return caption.length > 22 ? caption.slice(0, 22) + "..." : caption;
                })()}
              </div>
            </div>
          ))}
          {watchedVideos.length > PAGE_SIZE && (
            <div className="user-see-all-videos-wrapper">
              <button
                className="user-see-all-videos-btn"
                onClick={() => {
                  console.log("OPEN USER FULL VIDEO PAGE", userData.id);
                  router.push(`/user/${userData.id}/videos`);
                }}
              >
                See All Videos ({watchedVideos.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
    <div className="user-bottom-nav">
      <div className="flex flex-col items-center" onClick={() => router.push("/")}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        <span>Home</span>
      </div>
      <div
        className="flex flex-col items-center"
        onClick={() => {
          if (!userData.is_creator) {
            setShowCreatorModal(true);
          } else {
            router.push("/subscribers");
          }
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128A9.003 9.003 0 0012 18c-1.042 0-2.042.177-3 .5m6 0A9.003 9.003 0 0112 18m3 .5a3 3 0 10-6 0m6 0H9m9-6a3 3 0 11-6 0 3 3 0 016 0zm-9 0a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span>Subscribers</span>
      </div>
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            if (!userData.is_creator) {
              setShowCreatorModal(true);
            } else {
              router.push("/upload/create");
            }
          }}
        >
          +
        </button>
      </div>
      <div className="flex flex-col items-center" onClick={() => router.push("/notifications")}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0018 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 00-2.311 6.022 23.848 23.848 0 005.454 1.31m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span>Notifications</span>
      </div>
      <div className="flex flex-col items-center" onClick={() => router.push("/profile/edit")}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Edit Profile</span>
      </div>
    </div>
    {showCreatorModal && (
      <BecomeCreatorModal
        onClose={() => {
          setShowCreatorModal(false);
        }}
      />
    )}
    {selectedVideo && (
      <VideoModal
        videoData={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    )}
  </motion.div>
  );
};

export default UserProfile;
