import React from "react";

const Skeleton = () => {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-video shimmer"></div>

      <div className="skeleton-info">
        <div className="skeleton-title shimmer"></div>
        <div className="skeleton-creator shimmer"></div>
      </div>
    </div>
  );
};

export default Skeleton;