import React, { useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useLikesStore } from "../stores/likesStore.js";
import { usePostsStore } from "../stores/postsStore.js";

const Like = ({ postId, isVideoPart }) => {
  const { likesMap, fetchLikeState, toggleLike } = useLikesStore();
  const { postsMap } = usePostsStore();

  const likeState = likesMap[postId] || { hasLiked: false };
  const likesCount = postsMap[postId]?.likes_count ?? 0;

  useEffect(() => {
    fetchLikeState(postId, isVideoPart);
  }, [postId, isVideoPart]);

  const handleToggle = async () => {
    const res = await toggleLike(postId, isVideoPart);
    if (!res) {
      toast.error("Please login to like this post");
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
