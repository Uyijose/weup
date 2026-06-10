import { useRouter } from "next/router";
import Header from "../../../components/Header";
import LeftHandSide from "../../../components/LeftHandSide";
import { useState, useEffect } from "react";
import { useWatchedHistoryStore } from "../../../stores/watchedHistoryStore";
import { useUsersStore } from "../../../stores/usersStore";
import { usePostsStore } from "../../../stores/postsStore";
import { supabase } from "../../../utils/supabaseClient";

const UserVideosPage = ({ user, videos }) => {
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [pageVideos, setPageVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const watchedVideos = useWatchedHistoryStore(state => state.watchedVideos);
  const fetchWatchedHistory = useWatchedHistoryStore(state => state.fetchWatchedHistory);
  const hydrateWatchedFeed = usePostsStore(state => state.hydrateWatchedFeed);

  const usersMap = useUsersStore(state => state.usersMap);
  const fetchUserById = useUsersStore(state => state.fetchUserById);

  const PAGE_SIZE = 12;

  useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setPageVideos(watchedVideos.slice(start, end));
  }, [currentPage, watchedVideos]);

  const totalPages = Math.ceil(watchedVideos.length / PAGE_SIZE);

  useEffect(() => {
    if (!user?.id) return;
    fetchWatchedHistory(user.id);
  }, [user?.id]);

  useEffect(() => {
    const fetchCreators = async () => {
      for (const video of watchedVideos) {
        if (!video?.user_id) continue;
        await fetchUserById(video.user_id);
      }
    };

    fetchCreators();
  }, [watchedVideos]);

  useEffect(() => {
    if (!watchedVideos.length) return;
    hydrateWatchedFeed(watchedVideos);
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
                      if (video.parent_post_id && video.id !== video.parent_post_id) {
                        router.push(
                          `/posts/${video.parent_post_id}?part=${video.topic?.replace("Part ", "")}&feed=watched`
                        );
                      } else {
                        router.push(`/posts/${video.id}?feed=watched`);
                      }
                    }}
                  />
                  <div className="video-info">
                    <p className="video-title">{video.caption || "Untitled"}</p>
                    <p className="video-creator">
                      {(() => {
                        const videoOwner = usersMap[video.user_id];
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
    </div>
  );
};

export async function getServerSideProps({ params }) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !user) {
    return { notFound: true };
  }

  return {
    props: {
      user
    }
  };
}

export default UserVideosPage;