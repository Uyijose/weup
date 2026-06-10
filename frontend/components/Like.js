import React, { useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useLikesStore } from "../stores/likesStore.js";
import { usePostsStore } from "../stores/postsStore.js";

const Like = ({ postId, videoPartId, isVideoPart }) => {
  const { likesMap, fetchLikeState, toggleLike } = useLikesStore();
  const { postsMap } = usePostsStore();

  const keyId = isVideoPart ? videoPartId : postId;

  const likeState = likesMap[keyId] || { hasLiked: false };

  const likesCount =
    postsMap[keyId]?.likes_count ?? 0;

  useEffect(() => {
    if (!keyId) return;
    fetchLikeState(keyId, isVideoPart);
  }, [keyId, isVideoPart]);

  const handleToggle = async () => {
    const res = await toggleLike(keyId, isVideoPart);

    if (!res) {
      toast.error("Please login to like this post");
    } else {
      console.log("[LIKE SUCCESS]", res);
    }
  };

  return (
    <div className="video-action-btn">
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
        <div
          onClick={handleToggle}
          style={{ fontSize: "28px", cursor: "pointer", userSelect: "none" }}
        >
          {likeState.hasLiked ? "❤️" : "🤍"}
        </div>
      </motion.div>
      <span>{likesCount}</span>
    </div>
  );
};

export default Like;
