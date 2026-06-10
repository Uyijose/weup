import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { usePostsStore } from "../../stores/postsStore";
import RightHandSide from "../RightHandSide";

const DetailFeed = ({ onTitle }) => {
  const router = useRouter();
  const { id, part, feed } = router.query;

  useEffect(() => {
    if (!router.isReady || !id) return;

    let cancelled = false;

    const run = async () => {

      const store = usePostsStore.getState();

      if (!store.allPosts.length) {
        const data = await store.fetchAllPosts();
        store.hydrateAllPosts(data || []);
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const allPosts = usePostsStore.getState().allPosts;

      const partNumber = part ? Number(part) : null;

      let resolved = null;

      if (partNumber !== null) {
        const compositeId = `${id}-part-${partNumber}`;

        resolved = allPosts.find(p => p.id === compositeId);
      }

      if (!resolved) {
        resolved = allPosts.find(
          p => p.type !== "part" && String(p.id) === String(id)
        );
      }

      if (onTitle && resolved?.caption) {
        onTitle(resolved.caption);
      }

      if (!resolved || cancelled) return;
      const feedCategory = feed || "explore";

      if (feedCategory === "creator") {
        const creatorId = resolved.user_id;

        console.log("[DETAIL FEED] CREATOR MODE", {
          creatorId,
          resolvedPost: resolved.id
        });

        store.hydrateCreatorFeed(null, creatorId);
      } else {
        console.log("[DETAIL FEED] NORMAL MODE", feedCategory);
        store.setActiveFeed(store.allPosts, feedCategory);
      }

      await new Promise(resolve => setTimeout(resolve, 0));

      const updatedStore = usePostsStore.getState();

      const orderedIds = updatedStore.activeFeed.orderedIds;

      let startIndex = orderedIds.findIndex(x => x === resolved.id);

      if (startIndex === -1) {
        updatedStore.setActiveFeed(updatedStore.allPosts, feedCategory);

        await new Promise(resolve => setTimeout(resolve, 0));

        const refreshed = usePostsStore.getState();
        startIndex = refreshed.activeFeed.orderedIds.findIndex(
          x => x === resolved.id
        );
      }

      updatedStore.setCurrentIndex(startIndex >= 0 ? startIndex : 0);

      const finalStore = usePostsStore.getState();

      const initialPosts = finalStore.activeFeed.orderedIds
        .slice(startIndex, startIndex + 3)
        .map(id => finalStore.postsMap[id])
        .filter(Boolean);
      usePostsStore.setState({
        posts: initialPosts,
        renderedIds: initialPosts.map(p => p.id)
      });
      usePostsStore.setState({
        posts: initialPosts,
        renderedIds: initialPosts.map(p => p.id)
      });

      setTimeout(() => {
        const s = usePostsStore.getState();
        s.appendNextPost();
        s.appendNextPost();
      }, 0);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id, part]);

  return <RightHandSide />;
};

export default DetailFeed;