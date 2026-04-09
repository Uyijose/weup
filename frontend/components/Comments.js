import React, { useEffect, useState } from "react";
import moment from "moment";
import avatarFallback from "./assets/avatar-fallback.jpg";
import CommentSectionAd from "./ads/CommentSectionAd";
import { HiOutlinePhotograph } from "react-icons/hi";
import { getAuthToken } from "../utils/getAuthToken.js";
import toast from "react-hot-toast";
import { useCommentsStore } from "../stores/commentsStore.js";

const Comments = ({ postId, originalPostId, onClose, onCountChange }) => {
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const { commentsMap, fetchComments, addComment } = useCommentsStore();
  const comments = commentsMap[postId] || [];

  useEffect(() => {
    fetchComments(postId, originalPostId).then((data) =>
      onCountChange?.(data.length)
    );
  }, [postId, originalPostId]);

  const sendComment = async (e) => {
    e.preventDefault();
    const token = await getAuthToken();
    if (!token) return toast.error("Please login to comment");
    if (!comment) return;

    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: originalPostId ? originalPostId : postId,
          video_part_id: originalPostId ? postId : null,
          comment,
          image_url: imageUrl,
        }),
      }
    );

    const data = await res.json();
    addComment(postId, data);
    onCountChange?.(comments.length + 1);

    setComment("");
    setImageUrl("");
    setLoading(false);
  };

  return (
    <>
      <div className="comment-modal-header">
        <div className="comment-header-left">
          <h2 className="comment-title">Comments</h2>
          <span className="comment-count">{comments.length}</span>
        </div>
        <button onClick={onClose} className="comment-modal-close">×</button>
      </div>

      <div className="comment-modal-body">
        {comments.length > 0 ? (
          <div className="comment-list">
            {/* <CommentSectionAd /> */}
            {comments.map((c) => (
              <div className="comment-item" key={c.id}>
                <img
                  className="comment-avatar"
                  src={c.users?.avatar_url || avatarFallback.src}
                  alt="avatar"
                />
                <div className="comment-text">
                  <span className="comment-user">@{c.users?.username}</span>
                  <p>{c.comment}</p>
                  {c.image_url && (
                    <img src={c.image_url} className="comment-image" alt="comment" />
                  )}
                  <span className="comment-time">{moment(c.created_at).fromNow()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-comments">
            No comments yet 
            {/* <CommentSectionAd /> */}
          </div>
        )}

        <form className="comment-input-form" onSubmit={sendComment}>
          <div className="comment-input-wrapper">
            <textarea
              rows={1}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <label className="comment-image-icon">
              <HiOutlinePhotograph size={20} />
              <input
                type="file"
                accept="image/*"
                className="comment-image-input"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const reader = new FileReader();
                    reader.onload = () => setImageUrl(reader.result);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
          <button
            type="submit"
            className={`comment-post-btn ${loading ? "loading" : ""}`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Comments;
