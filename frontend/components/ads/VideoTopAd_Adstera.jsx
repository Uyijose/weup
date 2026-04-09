import React, { useEffect } from "react";

const VideoTopAd = ({ videoId }) => {
  useEffect(() => {
    const scriptId = `adsterra-banner-script-${videoId}`;
    if (document.getElementById(scriptId)) {
      return;
    }

    const containerId = `adsterra-top-banner-${videoId}`;
    const container = document.getElementById(containerId);
    if (!container) return;
    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.innerHTML = `
      var atOptions = {
        'key' : 'f9b1154a56389731d59cbea04c989f95',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.id = scriptId;
    invokeScript.type = "text/javascript";
    invokeScript.src =
      "https://www.highperformanceformat.com/f9b1154a56389731d59cbea04c989f95/invoke.js";

    container.appendChild(optionsScript);
    container.appendChild(invokeScript);
  }, [videoId]);

  return (
    <div className="ad-slot ad-top">
      <div
        id={`adsterra-top-banner-${videoId}`}
        style={{
          width: "100%",
          height: "50px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default VideoTopAd;