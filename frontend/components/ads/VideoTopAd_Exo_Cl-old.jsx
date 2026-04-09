import React, { useEffect } from "react";

const VideoTopAd = ({ videoId }) => {
  useEffect(() => {
    const scriptId = `exo-ad-script-${videoId}`;

    // Prevent duplicate script
    if (document.getElementById(scriptId)) return;

    // Load ExoClick script
    const script = document.createElement("script");
    script.src = "https://a.magsrv.com/ad-provider.js";
    script.async = true;
    script.id = scriptId;

    document.body.appendChild(script);

    // Push ad render
    window.AdProvider = window.AdProvider || [];
    window.AdProvider.push({ serve: {} });

  }, [videoId]);

  return (
    <div className="ad-slot ad-top">
      <ins
        className="eas6a97888e2"
        data-zoneid="5875228"
        style={{
          display: "block",
          width: "100%",
          height: "50px",
        }}
      ></ins>
    </div>
  );
};

export default VideoTopAd;