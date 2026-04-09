import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Post from "./Post";
import PopunderPostsAd from "./ads/popunder_posts.jsx";
import Skeleton from "./Skeleton/Skeleton";
import { getAuthToken } from "../utils/getAuthToken.js";
import { usePostsStore } from "../stores/postsStore.js";

const RightHandSide = () => {
  const router = useRouter();
  const postIdFromUrl = router.query.id;
  const postRefs = useRef({});
  const containerRef = useRef(null);
  const hasSwitchedRouteRef = useRef(false);

  const posts = usePostsStore(state => state.posts);
  const hydrateAllPosts = usePostsStore(state => state.hydrateAllPosts);
  const loadInitialPosts = usePostsStore(state => state.loadInitialPosts);
  const appendNextPost = usePostsStore(state => state.appendNextPost);
  const forceFirstPost = usePostsStore(state => state.forceFirstPost);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const fetchPosts = async () => {
      const token = await getAuthToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const response = await res.json();
      const allPosts = Array.isArray(response)
        ? response
        : Array.isArray(response.posts)
        ? response.posts
        : Array.isArray(response.data)
        ? response.data
        : [];
      if (!allPosts.length) {
        return;
      }

      let orderedPosts = [...allPosts].sort(() => Math.random() - 0.5);

      if (postIdFromUrl) {
        const selected = orderedPosts.find(p => p.id === postIdFromUrl);
        const rest = orderedPosts.filter(p => p.id !== postIdFromUrl);

        if (selected) {
          orderedPosts = [selected, ...rest];
        } else {
          console.log("PostId not found in posts:", postIdFromUrl);
        }
      } else {
        console.log("No postId in URL");
      }

      hydrateAllPosts(orderedPosts);
      loadInitialPosts();
    };

    fetchPosts();
  }, [router.isReady, postIdFromUrl]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }
    let lastIndex = 0;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;

      const index = Math.floor(scrollTop / height);

      if (index !== lastIndex) {
        if (
          index > 0 &&
          router.asPath.startsWith("/posts/") &&
          !hasSwitchedRouteRef.current
        ) {
          hasSwitchedRouteRef.current = true;

          window.history.replaceState(
            null,
            "",
            "/posts"
          );
        }

        lastIndex = index;

        if (index >= posts.length - 2) {
          appendNextPost();
        }
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [posts]);

  return (
  <div className="right" ref={containerRef}>
    {posts.length ? (
      posts.map((post, index) => (
        <React.Fragment key={post.id}>
          <div
            className="post-snap"
            ref={el => {
              if (el) postRefs.current[post.id] = el;
            }}
          >
            {(index + 1) % 5 === 0 ? (
              <PopunderPostsAd post={post} index={index} />
            ) : (
              <Post post={post} />
            )}
          </div>
        </React.Fragment>
      ))
    ) : (
      <Skeleton />
    )}
  </div>
);
};

export default RightHandSide;