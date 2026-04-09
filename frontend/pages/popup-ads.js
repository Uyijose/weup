import Head from "next/head";
import { useEffect } from "react";

const PopupAdsPage = () => {
  useEffect(() => {
    const scriptId = "popup-ads-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/javascript";
      script.async = true;

      // The popunder ad script
      script.innerHTML = `(function() {
        var adConfig = {
          "ads_host": "a.pemsrv.com",
          "syndication_host": "s.pemsrv.com",
          "idzone": 5884826,
          "popup_fallback": false,
          "popup_force": false,
          "chrome_enabled": true,
          "new_tab": false,
          "frequency_period": 720,
          "frequency_count": 1,
          "trigger_method": 3,
          "trigger_class": "",
          "trigger_delay": 0,
          "capping_enabled": true,
          "tcf_enabled": true,
          "only_inline": false
        };
        window.popMagic = window.popMagic || {};
        popMagic.init && popMagic.init(adConfig);
      })();`;

      document.body.appendChild(script);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Popup Ads | WhosUp</title>
        <meta
          name="description"
          content="Popunder ad demo on WhosUp"
        />
      </Head>

      <div className="ads-page-wrapper">
        <div className="ads-page-header">Popunder Ad Demo</div>
        <div className="ads-page-content">
          <p style={{ color: "#fff", textAlign: "center" }}>
            Click anywhere or interact with the page to trigger the popunder ad.
          </p>
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
      `}</style>
    </>
  );
};

export default PopupAdsPage;