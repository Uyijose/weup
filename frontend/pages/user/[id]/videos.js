import { useRouter } from "next/router";
import Header from "../../../components/Header";
import LeftHandSide from "../../../components/LeftHandSide";
import { useState, useEffect } from "react";
import { useWatchedHistoryStore } from "../../../stores/watchedHistoryStore";
import { useUsersStore } from "../../../stores/usersStore";
import { supabase } from "../../../utils/supabaseClient";
import VideoModal from "../../../components/VideoModal";

const UserVideosPage = ({ user, videos }) => {
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [pageVideos, setPageVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const watchedVideos = useWatchedHistoryStore(state => state.watchedVideos);
  const fetchWatchedHistory = useWatchedHistoryStore(state => state.fetchWatchedHistory);

  const usersMap = useUsersStore(state => state.usersMap);
  const fetchUserById = useUsersStore(state => state.fetchUserById);

  const PAGE_SIZE = 12;

  useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    console.log("WATCHED VIDEOS:", watchedVideos);
    console.log("CURRENT PAGE:", currentPage);
    console.log("PAGE RANGE:", start, end);

    setPageVideos(watchedVideos.slice(start, end));
  }, [currentPage, watchedVideos]);

  const totalPages = Math.ceil(watchedVideos.length / PAGE_SIZE);

  useEffect(() => {
    if (!user?.id) return;

    console.log("FETCH WATCHED HISTORY FOR USER:", user.id);
    fetchWatchedHistory(user.id);
  }, [user?.id]);

  useEffect(() => {
    const fetchCreators = async () => {
      for (const video of watchedVideos) {
        if (!video?.user_id) continue;

        console.log("FETCH VIDEO OWNER:", video.id, video.user_id);

        await fetchUserById(video.user_id);
      }
    };

    fetchCreators();
  }, [watchedVideos]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = new Set();
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    pages.add(1);

    if (start > 2) pages.add("left-ellipsis");

    for (let i = start; i <= end; i++) pages.add(i);

    if (end < totalPages - 1) pages.add("right-ellipsis");

    pages.add(totalPages);

    return (
      <div className="explore-pagination">
        {[...pages].map((p) =>
          typeof p === "string" ? (
            <span key={p} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={`page-${p}`}
              className={`pagination-btn ${p === currentPage ? "active" : ""}`}
              onClick={() => {
                console.log("GO TO PAGE", p);
                setCurrentPage(p);
              }}
            >
              {p}
            </button>
          )
        )}
      </div>
    );
  };

  return (
    <div className="explore-page-wrapper">
      <Header mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />
      <main>
        <LeftHandSide mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />
        <div className="explore-content">
          <h1 className="explore-header">@{user.username} Watched Videos</h1>

          {pageVideos.length === 0 ? (
            <div className="explore-empty">
              <p>No watched videos yet.</p>
            </div>
          ) : (
            <div className="explore-grid">
              {pageVideos.map((video) => (
                <div key={video.id} className="explore-card">
                  <video
                    src={video.video_url}
                    className="explore-video"
                    muted
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
                  <div className="video-info">
                    <p className="video-title">{video.caption || "Untitled"}</p>
                    <p className="video-creator">
                      {(() => {
                        const videoOwner = usersMap[video.user_id];

                        console.log("VIDEO OWNER LOOKUP:", {
                          videoId: video.id,
                          videoUserId: video.user_id,
                          owner: videoOwner
                        });

                        if (videoOwner?.creator_username) {
                          return `@${videoOwner.creator_username}`;
                        }

                        if (videoOwner?.username) {
                          return `@${videoOwner.username}`;
                        }

                        return "@unknown";
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {renderPagination()}
        </div>
      </main>

      {selectedVideo && (
        <VideoModal
          videoData={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export async function getServerSideProps({ params }) {
  console.log("GET SERVER SIDE PROPS USER ID:", params.id);

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.id)
    .single();

  console.log("SERVER USER FETCH:", user);
  console.log("SERVER USER ERROR:", error);

  if (error || !user) {
    console.log("USER NOT FOUND");
    return { notFound: true };
  }

  return {
    props: {
      user
    }
  };
}

export default UserVideosPage;