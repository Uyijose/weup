import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import Post from "./Post";

const VideoModal = ({ videoData, onClose }) => {
  const router = useRouter();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", videoData.id)
        .single();
      if (!error) setPost(data);
    };
    fetchPost();
  }, [videoData.id]);

  if (!post) return null;

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <Post post={post} allPosts={[post]} isModal={true} />
        <button className="video-modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default VideoModal;
