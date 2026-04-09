import React, { useEffect, useRef } from "react";

let adCounter = 0;

const FeedInlineAd = () => {
  const containerRef = useRef(null);
  const uniqueIdRef = useRef(`feed-ad-${++adCounter}`);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const localOptions = {
          key: "f9b1154a56389731d59cbea04c989f95",
          format: "iframe",
          height: 50,
          width: 320,
          params: {}
        };

        window.atOptions = localOptions;
        const script = document.createElement("script");
        script.src =
          "https://www.highperformanceformat.com/f9b1154a56389731d59cbea04c989f95/invoke.js";
        script.async = true;

        const container = containerRef.current;
        container.innerHTML = "";

        const innerDiv = document.createElement("div");
        innerDiv.id = uniqueIdRef.current;

        container.appendChild(innerDiv);
        container.appendChild(script);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="feed-inline-ad"
      style={{
        width: "100px",
        height: "150px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <img
        src="/feed-inline-ads.jpg"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
          zIndex: 1
        }}
        onLoad={() => console.log("FeedInlineAd: background image loaded")}
      />

      <div
        style={{
          position: "absolute",
          top: 2,
          left: 2,
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "1px 4px",
          fontSize: "10px",
          borderRadius: "2px",
          zIndex: 3
        }}
      >
        Ads
      </div>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          zIndex: 2
        }}
      ></div>
    </div>
  );
};

export default FeedInlineAd;