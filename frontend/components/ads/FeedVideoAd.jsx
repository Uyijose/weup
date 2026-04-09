import React, { useEffect, useRef, useState } from "react";

const FeedVideoAd = () => {
  const insRef = useRef(null);
  const hasServedRef = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    console.log("FeedVideoAd mounted");

    const SCRIPT_ID = "exo-ad-provider-global";

    const waitForIframe = () => {
      let attempts = 0;

      const interval = setInterval(() => {
        attempts++;

        const iframe = insRef.current?.querySelector("iframe");
        const video = insRef.current?.querySelector("video");

        console.log("Checking ad render...", attempts);

        if (iframe || video) {
          console.log("Ad content rendered successfully");
          setAdLoaded(true);
          clearInterval(interval);
        }

        if (attempts > 20) {
          console.log("Ad render timeout");
          clearInterval(interval);
        }
      }, 500);
    };

    const serveAd = () => {
      if (!insRef.current) {
        console.log("INS ref not ready");
        return;
      }

      if (hasServedRef.current) {
        console.log("Ad already served, skipping");
        return;
      }

      hasServedRef.current = true;

      console.log("Serving ExoClick ad");

      window.AdProvider = window.AdProvider || [];
      window.AdProvider.push({ serve: {} });

      waitForIframe();
    };

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://a.magsrv.com/ad-provider.js";
      script.async = true;

      script.onload = () => {
        console.log("ExoClick script loaded");
        setTimeout(serveAd, 500);
      };

      document.body.appendChild(script);
    } else {
      console.log("ExoClick script already exists");
      setTimeout(serveAd, 500);
    }

    return () => {
      console.log("FeedVideoAd unmounted");
    };
  }, []);

  return (
    <div className="video-wrapper ad-video-feed">
      <div className="ad-top ad-slot">
        <span>Sponsored</span>
      </div>

      <ins
        ref={insRef}
        className="eas6a97888e37"
        data-zoneid="5883840"
        style={{
          display: "block",
          width: "100%",
          minHeight: "100vh",
        }}
      />

      {!adLoaded && (
        <div className="ad-fallback">
          <span>Loading sponsored content…</span>
        </div>
      )}
    </div>
  );
};

export default FeedVideoAd;