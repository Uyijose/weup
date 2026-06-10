import React from "react";
import { useRouter } from "next/router";

const CustomPosts = ({ video, topic, userId, secondId, postId }) => {
  const router = useRouter();

  return (
    <div
      className="creator-video-item"
      onClick={() => {
        router.push(`/posts/${postId}`);
      }}
    >
      <video
        key={video}
        src={video}
        className="creator-video-style no-download-video"
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
};

export default CustomPosts;
