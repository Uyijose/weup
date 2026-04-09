import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

const CommentSectionAd = () => {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("ad_type", "comment_section_ad")
        .eq("status", "active")
        .order("priority", { ascending: false })
        .limit(1)
        .single();

      if (!error) setAd(data);
    };

    fetchAd();
  }, []);

  if (!ad || !visible) return null;

  return (
    <div
      className="comment-section-ad"
      style={{ backgroundColor: ad.bg_color || "#6A00F4" }}
    >
      <button
        className="comment-ad-close-btn"
        onClick={() => setVisible(false)}
      >
        ×
      </button>

      {ad.media_url && (
        <img
          src={ad.media_url.startsWith("data:image") ? ad.media_url : `data:image/jpeg;base64,${ad.media_url}`}
          alt="ad"
          className="comment-ad-img"
        />
      )}

      <div
        className="comment-ad-text"
        style={{ color: ad.text_color || "#EDEDED" }}
      >
        <span className="comment-ad-title">
          {ad.title || "Sponsored"}
        </span>
        <span className="comment-ad-desc">
          {ad.content || "Sponsored content"}
        </span>
        {ad.comment_image_url && (
          <img
            src={ad.comment_image_url.startsWith("data:image") ? ad.comment_image_url : `data:image/jpeg;base64,${ad.comment_image_url}`}
            className="comment-image"
          />
        )}
      </div>
    </div>
  );
};

export default CommentSectionAd;
