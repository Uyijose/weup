import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import LeftHandSide from "../../components/LeftHandSide";
import FeedInlineAd from "../../components/ads/FeedInlineAd";
import { usePostsStore } from "../../stores/postsStore";
import Skeleton from "../../components/Skeleton/Skeleton";


const Explore = () => {
  const router = useRouter();
  const allPosts = usePostsStore(state => state.allPosts);
  const fetchAllPosts = usePostsStore(state => state.fetchAllPosts);
  const explorePage = usePostsStore(state => state.explorePage);
  const setExplorePage = usePostsStore(state => state.setExplorePage);
  const getExploreTotalPages = usePostsStore(state => state.getExploreTotalPages);
  const resetExplorePage = usePostsStore(state => state.resetExplorePage);

  const [pageVideos, setPageVideos] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [category, setCategory] = useState("explore");

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);

      const posts = await fetchAllPosts();
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadPosts();
  }, []);

  useEffect(() => {
    setIsPageLoading(true);

    let processed = [...allPosts];

    if (category === "explore") {
      processed = [...processed].sort(() => Math.random() - 0.5);
    }

    if (category === "most_viewed") {
      processed = [...processed].sort(
        (a, b) => (b.views_count || 0) - (a.views_count || 0)
      );
    }

    if (category === "new") {
      processed = [...processed].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }
    setSortedPosts(processed);
    resetExplorePage();

    setTimeout(() => {
      setIsPageLoading(false);
    }, 400);
  }, [category, allPosts]);

  useEffect(() => {
    setIsPageLoading(true);

    if (!sortedPosts.length) {
      setPageVideos([]);
      setIsPageLoading(false);
      return;
    }

    const totalPages = Math.ceil(sortedPosts.length / 11);

    if (totalPages === 0) {
      setPageVideos([]);
      setIsPageLoading(false);
      return;
    }

    const safePage = ((explorePage - 1) % totalPages) + 1;

    const start = (safePage - 1) * 11;
    const end = start + 11;

    const slice = sortedPosts.slice(start, end);
    setPageVideos(slice);

    setTimeout(() => {
      setIsPageLoading(false);
    }, 400);
  }, [sortedPosts, explorePage]);

  const renderPagination = () => {
    const total = getExploreTotalPages();
    const current = explorePage;

    if (total <= 1) return null;

    const pages = new Set();
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    pages.add(1);

    if (start > 2) {
      pages.add("left-ellipsis");
    }

    for (let i = start; i <= end; i++) {
      pages.add(i);
    }

    if (end < total - 1) {
      pages.add("right-ellipsis");
    }

    pages.add(total);

    return (
      <div className="explore-pagination">
        {[...pages].map(p =>
          typeof p === "string" ? (
            <span
              key={p}
              className="pagination-ellipsis"
            >
              …
            </span>
          ) : (
            <button
              key={`page-${p}`}
              className={`pagination-btn ${p === current ? "active" : ""}`}
              onClick={() => setExplorePage(p)}
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
        <LeftHandSide
          mobileMenu={mobileMenu}
          setMobileMenu={setMobileMenu}
        />

        <div className="explore-content">
          <h1 className="explore-header">Explore</h1>

          <div className="explore-categories">
            <button
              className={`category-btn ${category === "explore" ? "active" : ""}`}
              onClick={() => {
                setCategory("explore");
              }}
            >
              Explore
            </button>

            <button
              className={`category-btn ${category === "most_viewed" ? "active" : ""}`}
              onClick={() => {
                setCategory("most_viewed");
              }}
            >
              Most Viewed
            </button>

            <button
              className={`category-btn ${category === "new" ? "active" : ""}`}
              onClick={() => {
                setCategory("new");
              }}
            >
              New
            </button>
          </div>

          {isLoading || isPageLoading ? (
            <div className="explore-grid">
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={i}
                  className="explore-card explore-skeleton-card"
                >
                  <Skeleton />
                </div>
              ))}
            </div>
          ) : pageVideos.length === 0 ? (
            <div className="explore-empty">
              <p>No videos available yet.</p>
            </div>
          ) : (
            <div className="explore-grid">
              {pageVideos.map((video, index) => (
                <React.Fragment key={video.id}>
                  <div className="explore-card">
                    <video
                      src={video.video_url}
                      className="explore-video"
                      onClick={() => {
                        const storageKey = `popunder_click_${explorePage}`;
                        const alreadyClicked = sessionStorage.getItem(storageKey);

                        if (!alreadyClicked) {
                          const pageNumber = explorePage;

                          if (pageNumber % 2 === 1) {
                            const script = document.createElement("script");
                            script.src =
                              "https://pl29006554.profitablecpmratenetwork.com/52/a1/c0/52a1c09e0162f848b769d07e30c130fc.js";
                            script.async = true;

                            document.body.appendChild(script);

                            sessionStorage.setItem(storageKey, "true");

                            setTimeout(() => {
                              document.body.click();
                            }, 200);
                          } else {
                            const adConfig = {
                              ads_host: "a.pemsrv.com",
                              syndication_host: "s.pemsrv.com",
                              idzone: 5884826
                            };

                            const url =
                              "https://" +
                              adConfig.syndication_host +
                              "/v1/link.php?idzone=" +
                              adConfig.idzone;

                            window.open(url, "_blank");

                            sessionStorage.setItem(storageKey, "true");
                          }

                          setTimeout(() => {
                            router.push(`/posts/${video.id}`);
                          }, 500);
                        } else {
                          router.push(`/posts/${video.id}`);
                        }
                      }}
                      muted
                    />
                    <div className="video-info">
                      <p className="video-title">
                        {video.caption || "Untitled"}
                      </p>
                      <p className="video-creator">
                        @{video.users?.creator_username || "unknown"}
                      </p>
                    </div>
                  </div>

                  {index === 3 && (
                    (() => {
                      return <FeedInlineAd />;
                    })()
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {renderPagination()}
        </div>
      </main>
    </div>
  );
};

export default Explore;