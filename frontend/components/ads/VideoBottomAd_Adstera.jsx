import React, { useEffect } from "react";

const VideoBottomAd = ({ videoId }) => {
  useEffect(() => {
    const scriptId = `adsterra-bottom-script-${videoId}`;
    if (document.getElementById(scriptId)) {
      return;
    }

    const containerId = `adsterra-bottom-banner-${videoId}`;
    const container = document.getElementById(containerId);
    if (!container) return;
    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.innerHTML = `
      atOptions = {
        'key' : 'af1d79b607c6ac80b55f377bec185951',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.id = scriptId;
    invokeScript.type = "text/javascript";
    invokeScript.src =
      "https://www.highperformanceformat.com/af1d79b607c6ac80b55f377bec185951/invoke.js";

    container.appendChild(optionsScript);
    container.appendChild(invokeScript);
  }, [videoId]);

  return (
    <div className="ad-slot ad-bottom">
      <div
        id={`adsterra-bottom-banner-${videoId}`}
        style={{
          width: "100%",
          height: "60px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default VideoBottomAd;