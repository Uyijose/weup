import React, { useEffect } from "react";

const VideoBottomAd = ({ videoId }) => {
  useEffect(() => {
    const scriptId = `exo-bottom-ad-script-${videoId}`;

    if (document.getElementById(scriptId)) {
      console.log("Bottom Ad: script already exists");
      return;
    }

    console.log("Bottom Ad: loading ExoClick script");

    const script = document.createElement("script");
    script.src = "https://a.magsrv.com/ad-provider.js";
    script.async = true;
    script.id = scriptId;

    document.body.appendChild(script);

    window.AdProvider = window.AdProvider || [];
    window.AdProvider.push({ serve: {} });

    console.log("Bottom Ad: ad requested");

  }, [videoId]);

  return (
    <div className="ad-slot ad-bottom">
      <ins
        className="eas6a97888e2"
        data-zoneid="5875352"
        style={{
          display: "block",
          width: "100%",
          height: "60px",
        }}
      ></ins>
    </div>
  );
};

export default VideoBottomAd;