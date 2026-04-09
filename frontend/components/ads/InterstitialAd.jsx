import React, { useEffect } from "react";

const InterstitialAd = () => {
  useEffect(() => {
    console.log("InterstitialAd mounted");

    const container = document.querySelectorAll(".interstitial-ad-container");

    const currentContainer = container[container.length - 1];

    if (!currentContainer) {
      console.log("No container found for this ad");
      return;
    }

    currentContainer.innerHTML = "";

    if (!container) {
      console.log("Interstitial container not found");
      return;
    }

    container.innerHTML = "";

    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = "https://a.pemsrv.com/ad-provider.js";

    const ins = document.createElement("ins");
    ins.className = "eas6a97888e35";
    ins.setAttribute("data-zoneid", "5876648");

    const script2 = document.createElement("script");
    script2.innerHTML = '(AdProvider = window.AdProvider || []).push({"serve": {}});';

    container.appendChild(script1);
    container.appendChild(ins);
    container.appendChild(script2);

    console.log("ExoClick Interstitial Injected");

    return () => {
      console.log("InterstitialAd cleanup");
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      id="interstitial-ad-container"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    />
  );
};

export default InterstitialAd;