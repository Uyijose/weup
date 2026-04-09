import React from "react";
import { useRouter } from "next/router";

const CustomPosts = ({ video, topic, userId, secondId, postId }) => {
  const router = useRouter();

  return (
    <div
      className="creator-video-item"
      onClick={() => {
        console.log("CUSTOM POSTS: REDIRECT TO VIDEO", postId);
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
          console.log("CUSTOM POSTS: RIGHT CLICK BLOCKED", postId);
        }}
        onDragStart={(e) => {
          e.preventDefault();
          console.log("CUSTOM POSTS: DRAG BLOCKED", postId);
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log("CUSTOM POSTS: VIDEO CLICKED", postId);
        }}
      />
    </div>
  );
};

export default CustomPosts;
