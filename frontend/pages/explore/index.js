import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../../components/Header";
import LeftHandSide from "../../components/LeftHandSide";
import { usePostsStore } from "../../stores/postsStore";
import Skeleton from "../../components/Skeleton/Skeleton";


const Explore = () => {
  const router = useRouter();
  const allPosts = usePostsStore(state => state.allPosts);
  const hydrateAllPosts = usePostsStore(state => state.hydrateAllPosts);
  const fetchAllPosts = usePostsStore(state => state.fetchAllPosts);
  const explorePage = usePostsStore(state => state.explorePage);
  const setExplorePage = usePostsStore(state => state.setExplorePage);
  const getExploreTotalPages = usePostsStore(state => state.getExploreTotalPages);
  const setActiveFeed = usePostsStore(state => state.setActiveFeed);
  const activeFeed = usePostsStore(state => state.activeFeed);

  const [pageVideos, setPageVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const exploreUIState = usePostsStore(state => state.exploreUIState);
  const setExploreUIState = usePostsStore(state => state.setExploreUIState);
  const category = exploreUIState.category;

  useEffect(() => {
    if (allPosts.length) {
      console.log("[EXPLORE] mount with cached posts");
      setIsLoading(false);
      return;
    }

    const run = async () => {
      console.log("[EXPLORE] manual hydrate");
      const posts = await fetchAllPosts();
      hydrateAllPosts(posts);
      setIsLoading(false);
    };

    run();
  }, [allPosts.length]);

  useEffect(() => {
  if (!allPosts.length) return;

  const { category: current, orderedIds } =
    usePostsStore.getState().activeFeed;

  if (current === category && orderedIds.length > 0) {
    console.log("[EXPLORE PAGE] feed already active & ready", category);
    return;
  }

  console.log("[EXPLORE PAGE] activating feed", category);
  setActiveFeed(allPosts, category);
}, [category, allPosts]);

  useEffect(() => {
    console.log("[EXPLORE] paginate from activeFeed", activeFeed.category);

    setIsPageLoading(true);

    if (!activeFeed.orderedIds.length) {
      setPageVideos([]);
      setIsPageLoading(false);
      return;
    }

    const totalPages = Math.ceil(activeFeed.orderedIds.length / 12);

    const safePage = ((explorePage - 1) % totalPages) + 1;
    const start = (safePage - 1) * 12;
    const end = start + 12;

    const slice = activeFeed.orderedIds
      .slice(start, end)
      .map(id => allPosts.find(p => p.id === id))
      .filter(Boolean);

    console.log("[EXPLORE] page slice size", slice.length);

    setPageVideos(slice);

    setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
  }, [activeFeed, explorePage]);

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
      <Head>
        <title>WeUp - Discover Viral Videos</title>

        <meta name="description" content="Watch, share, and discover trending short videos on WeUp." />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="WeUp - Discover Viral Videos" />
        <meta property="og:description" content="Watch, share, and discover trending short videos on WeUp." />
        <meta property="og:url" content="https://weup-dun.vercel.app/" />
        <meta property="og:site_name" content="WeUp" />
        <meta property="og:image" content="https://whosup.fun/whosup-icon.PNG" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WeUp - Discover Viral Videos" />
        <meta name="twitter:description" content="Watch, share, and discover trending short videos on WeUp." />
        <meta name="twitter:image" content="https://whosup.fun/whosup-icon.PNG" />
      </Head>
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
                console.log("[EXPLORE] switch category explore");
                setExploreUIState({ category: "explore" });
              }}
            >
              Explore
            </button>

            <button
              className={`category-btn ${category === "most_viewed" ? "active" : ""}`}
              onClick={() => {
                setExploreUIState({ category: "most_viewed" });
              }}
            >
              Most Viewed
            </button>

            <button
              className={`category-btn ${category === "new" ? "active" : ""}`}
              onClick={() => {
                setExploreUIState({ category: "new" });
              }}
            >
              New
            </button>
          </div>

          {isLoading || isPageLoading ? (
            <div className="explore-grid">
              {Array.from({ length: 12 }).map((_, i) => (
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
                        const hasParts =
                          video.type === "part" ||
                          video.partsCount > 0 ||
                          video.video_parts?.length > 0 ||
                          video.original_post?.partsCount > 0;

                        const postId = video.post_id || video.id;

                        console.log("[EXPLORE CLICK]", {
                          id: video.id,
                          type: video.type,
                          partsCount: video.partsCount,
                          rawParts: video.video_parts?.length,
                          originalParts: video.original_post?.partsCount,
                          resolvedHasParts: hasParts,
                          resolvedPostId: postId
                        });

                        if (video.type === "part") {
                          console.log("[NAVIGATE] explicit part", video.part_number);

                          router.push(
                            `/posts/${video.post_id}?part=${video.part_number}&feed=${category}`
                          );
                          return;
                        }

                        if (hasParts) {
                          console.log("[NAVIGATE] post has parts → force part 1");

                          router.push(
                            `/posts/${postId}?part=1&feed=${category}`
                          );
                          return;
                        }

                        console.log("[NAVIGATE] normal post (no parts)");

                        router.push(
                          `/posts/${postId}?feed=${category}`
                        );
                      }}
                      muted
                    />
                    <div className="video-info">
                      <p className="video-title">
                        {video.caption || "Untitled"}
                      </p>
                      <p className="video-creator">
                        @{
                          video.type === "part"
                            ? video.original_post?.users?.creator_username || "unknown"
                            : video.users?.creator_username || "unknown"
                        }
                      </p>
                    </div>
                  </div>
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