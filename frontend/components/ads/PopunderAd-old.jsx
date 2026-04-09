import React, { useEffect } from "react";

const PopunderAd = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("PopunderAd: initializing popunder ad");

      const script = document.createElement("script");
      script.src =
        "https://pl29006554.profitablecpmratenetwork.com/52/a1/c0/52a1c09e0162f848b769d07e30c130fc.js";
      script.async = true;

      document.body.appendChild(script);

      console.log("PopunderAd: script injected");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        width: "100px",
        height: "150px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: "10px"
      }}
    >
      <img
        src="/popunder-ads.jpg"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
          zIndex: 1
        }}
        onLoad={() => console.log("PopunderAd: background image loaded")}
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
    </div>
  );
};

export default PopunderAd;