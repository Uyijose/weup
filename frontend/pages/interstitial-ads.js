import Head from "next/head";
import React, { useEffect, useRef } from "react";

const InterstitialAdsPage = () => {
  const adContainerRef = useRef(null);
  const hasServedRef = useRef(false);

  useEffect(() => {
    if (!adContainerRef.current) return;

    adContainerRef.current.innerHTML = `
      <ins class="eas6a97888e35" data-zoneid="5884786"></ins>
    `;

    const serveAd = () => {
      if (hasServedRef.current) return;
      hasServedRef.current = true;

      window.AdProvider = window.AdProvider || [];
      window.AdProvider.push({ serve: {} });

      console.log("Interstitial ad served");
    };

    const existingScript = document.getElementById("interstitial-ads-script");

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "interstitial-ads-script";
      script.src = "https://a.pemsrv.com/ad-provider.js";
      script.async = true;
      script.onload = serveAd;
      document.body.appendChild(script);
    } else {
      serveAd();
    }
  }, []);

  return (
    <>
      <Head>
        <title>Interstitial Ads | weup</title>
        <meta
          name="description"
          content="Interstitial ad content on weup"
        />
      </Head>

      <div className="ads-page-wrapper">
        <div className="ads-page-header">Interstitial Ad Demo</div>
        <div className="ads-page-content">
          <div ref={adContainerRef} className="ads-zone-wrapper" />
        </div>
      </div>

      <style jsx>{`
        .ads-page-wrapper {
          width: 100%;
          min-height: 100vh;
          background: #12061f;
          display: flex;
          flex-direction: column;
        }

        .ads-page-header {
          width: 100%;
          padding: 16px;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          color: #ededed;
          background: #1a0033;
          border-bottom: 1px solid #34214d;
        }

        .ads-page-content {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #1b0d2b;
        }

        .ads-zone-wrapper {
          width: 100%;
          max-width: 100%;
          min-height: 100vh;
          background: black;
        }
      `}</style>
    </>
  );
};

export default InterstitialAdsPage;