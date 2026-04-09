import Head from "next/head";
import React, { useEffect, useRef } from "react";

const BannerAdsPage = () => {
  const adContainerRef = useRef(null);
  const hasServedRef = useRef(false);

  useEffect(() => {
    if (!adContainerRef.current) return;

    adContainerRef.current.innerHTML = `
      <ins class="eas6a97888e2" data-zoneid="5875286"></ins>
    `;

    const serveAd = () => {
      if (hasServedRef.current) return;
      hasServedRef.current = true;

      window.AdProvider = window.AdProvider || [];
      window.AdProvider.push({ serve: {} });

      console.log("Banner ad served");
    };

    const existingScript = document.getElementById("banner-ads-script");

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "banner-ads-script";
      script.src = "https://a.magsrv.com/ad-provider.js";
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
        <title>Banner Ads | WhosUp</title>
        <meta
          name="description"
          content="Banner ad content on WhosUp"
        />
      </Head>

      <div className="ads-page-wrapper">
        <div className="ads-page-header">Banner Ad Demo</div>
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
          max-width: 728px;
          min-height: 90px;
          background: black;
        }
      `}</style>
    </>
  );
};

export default BannerAdsPage;