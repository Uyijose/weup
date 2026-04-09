import Head from "next/head";
import React, { useEffect, useRef } from "react";

const AdsPage = () => {
  const adContainerRef = useRef(null);
  const hasServedRef = useRef(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (hasMountedRef.current) {
      console.log("ADS page already mounted once, skipping duplicate mount");
      return;
    }

    hasMountedRef.current = true;

    console.log("ADS page mounted");

    if (!adContainerRef.current) {
      console.log("Ad container missing");
      return;
    }

    adContainerRef.current.innerHTML = `
      <ins class="eas6a97888e37" data-zoneid="5883840"></ins>
    `;

    console.log("INS tag injected");

    const serveAd = () => {
      if (hasServedRef.current) {
        console.log("Ad already served, skipping");
        return;
      }

      hasServedRef.current = true;

      console.log("Injecting ExoClick serve");

      window.AdProvider = window.AdProvider || [];
      window.AdProvider.push({ serve: {} });

      setTimeout(() => {
        const ins = adContainerRef.current?.querySelector("ins");

        console.log("INS after serve:", ins);

        if (ins) {
          console.log("INS innerHTML:", ins.innerHTML);
          console.log("INS attributes:", ins.outerHTML);
        }
      }, 2000);
    };

    const existingScript = document.getElementById("exo-ads-script");

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "exo-ads-script";
      script.src = "https://a.magsrv.com/ad-provider.js";
      script.async = true;

      script.onload = () => {
        console.log("ExoClick script loaded");
        setTimeout(serveAd, 500);
      };

      script.onerror = () => {
        console.log("FAILED loading ExoClick script");
      };

      document.body.appendChild(script);
    } else {
      console.log("ExoClick script already exists");
      setTimeout(serveAd, 500);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Sponsored Video | WhosUp</title>
        <meta
          name="description"
          content="Sponsored video content on WhosUp"
        />
        <meta
          httpEquiv="Delegate-CH"
          content="Sec-CH-UA https://s.magsrv.com; Sec-CH-UA-Mobile https://s.magsrv.com; Sec-CH-UA-Arch https://s.magsrv.com; Sec-CH-UA-Model https://s.magsrv.com; Sec-CH-UA-Platform https://s.magsrv.com; Sec-CH-UA-Platform-Version https://s.magsrv.com; Sec-CH-UA-Bitness https://s.magsrv.com; Sec-CH-UA-Full-Version-List https://s.magsrv.com; Sec-CH-UA-Full-Version https://s.magsrv.com;"
        />
      </Head>

      <div className="ads-page-wrapper">
        <div className="ads-page-header">
          Sponsored Video Demo
        </div>

        <div className="ads-page-content">
          <div
            ref={adContainerRef}
            className="ads-zone-wrapper"
          />
        </div>
      </div>

      <style jsx>{`
        .ads-page-wrapper {
          width: 100%;
          height: 100vh;
          background: #12061f;
          display: flex;
          flex-direction: column;
          overflow: hidden;
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
          max-width: 520px;
          min-height: 100vh;
          background: black;
        }
      `}</style>
    </>
  );
};

export default AdsPage;