import { useRouter } from "next/router";
import Header from "../../../components/Header";
import LeftHandSide from "../../../components/LeftHandSide";
import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";
import VideoModal from "../../../components/VideoModal";

const CreatorVideosPage = ({ creator, videos }) => {
    const router = useRouter();
    const [mobileMenu, setMobileMenu] = useState(false);
    const [pageVideos, setPageVideos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const PAGE_SIZE = 12;

    console.log("CREATOR VIDEOS PAGE:", {
    creator,
    totalVideos: videos.length
    });

    useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setPageVideos(videos.slice(start, end));
    }, [currentPage, videos]);

    const totalPages = Math.ceil(videos.length / PAGE_SIZE);

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = new Set();
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        pages.add(1);

        if (start > 2) {
            pages.add("left-ellipsis");
        }

        for (let i = start; i <= end; i++) {
            pages.add(i);
        }

        if (end < totalPages - 1) {
            pages.add("right-ellipsis");
        }

        pages.add(totalPages);

        return (
            <div className="explore-pagination">
                {[...pages].map(p =>
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
        <Header
            mobileMenu={mobileMenu}
            setMobileMenu={setMobileMenu}
        />

        <main>
            <LeftHandSide
            mobileMenu={mobileMenu}
            setMobileMenu={setMobileMenu}
            />

            <div className="explore-content">
            <h1 className="explore-header">
                @{creator.creator_username} Videos
            </h1>

            {pageVideos.length === 0 ? (
                <div className="explore-empty">
                    <p>No videos uploaded yet.</p>
                </div>
                ) : (
                <div className="explore-grid">
                    {pageVideos.map((video, index) => (
                    <div key={video.id} className="explore-card">
                        <video
                            src={video.video_url}
                            className="explore-video"
                            muted
                            onClick={() => {
                                console.log("OPEN MODAL VIDEO", video.id);
                                setSelectedVideo(video);
                            }}
                            playsInline
                            preload="metadata"
                            controls={false}
                            disablePictureInPicture
                            controlsList="nodownload noplaybackrate nofullscreen"
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                        />
                        <div className="video-info">
                        <p className="video-title">{video.caption || "Untitled"}</p>
                        <p className="video-creator">@{creator.creator_username}</p>
                        </div>
                        {index === 5}
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
  console.log("GET CREATOR VIDEOS PAGE:", params.id);

  const { data: creator, error } = await supabase
    .from("users")
    .select("*")
    .eq("creator_username", params.id)
    .single();

  if (error || !creator) {
    console.log("CREATOR NOT FOUND:", params.id);

    return {
      notFound: true
    };
  }

  const { data: videos } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", creator.id)
    .order("created_at", { ascending: false });

  console.log("CREATOR VIDEOS FETCHED:", {
    creatorId: creator.id,
    totalVideos: videos?.length || 0
  });

  return {
    props: {
      creator,
      videos: videos || []
    }
  };
}

export default CreatorVideosPage;