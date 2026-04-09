import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

const VideoPausePopupAd = () => {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("ad_type", "video_pause_popup")
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
    <div className="ad-pause-popup" style={{ backgroundColor: ad.bg_color || "#000000cc" }}>
      <div className="ad-pause-content" style={{ color: ad.text_color || "#EDEDED" }}>
        {ad.media_url && <img src={ad.media_url} alt="ad" />}
        <h3>{ad.title || "Sponsored"}</h3>
        {ad.content && <p>{ad.content}</p>}
        <button onClick={() => setVisible(false)}>Close</button>
      </div>
    </div>
  );
};

export default VideoPausePopupAd;
