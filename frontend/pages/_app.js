import '../styles/globals.css'
import '../components/styles/videoOverlay.css'
import '../components/styles/commentModal.css'
import '../components/styles/createVideo.css'
import '../components/styles/right-side.css'
import "../components/styles/left-side.css";
import '../components/styles/UserProfile.css'
import '../components/styles/AdminPanel.css'
import '../components/styles/CreatorProfile.css'
import "../components/styles/EditProfile.css";
import "../components/styles/Auth.css";
import "../components/styles/Explore.css";
import "../components/styles/CreatorList.css";
import "../components/styles/BecomeCreatorModal.css";
import "../components/styles/BecomeCreator.css";
import "../components/styles/Header.css";
import "../components/styles/Subscribers.css";
import "../components/styles/SearchPage.css";
import "../components/styles/AdminHeader.css";
import "../components/styles/Legal.css";
import "../components/styles/SwipeUpHint.css";
import "../components/styles/videoModal.css";

import Head from "next/head";
import { useEffect, useState } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from 'next/router';
import { useAuthStore } from "../stores/authStore";
import { supabase } from "../utils/supabaseClient";
import Script from 'next/script';
import * as gtag from '../utils/gtag';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { user, loading, hydrateAuth, showAgeGate, checkAgeGate, confirmAdult } = useAuthStore();

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    console.log("[APP] bootstrapping auth");
    hydrateAuth();
  }, []);
  useEffect(() => {
  console.log("[APP] registering auth listener");
  const sub = useAuthStore.getState().listenToAuthChanges();

  return () => {
    console.log("[APP] removing auth listener");
    sub?.unsubscribe?.();
  };
}, []);


  useEffect(() => {
    if (!router.isReady) return;
    if (loading) return;
    if (showAgeGate) {
      return;
    }
  }, [router.isReady, loading, showAgeGate, router.pathname]);

  useEffect(() => {
    if (loading) return;
    console.log("[APP] checking age gate");
    checkAgeGate();
  }, [loading, user]);

  const handleAgeSubmit = async () => {
    if (selectedAnswer === null) {
      alert("Please select an option");
      return;
    }

    if (!selectedAnswer) {
      window.location.href = "https://www.google.com";
      return;
    }

    await confirmAdult();
  };

  // Track page views on route change
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    },
    modal: {
      background: "#1A0033",
      padding: "30px",
      borderRadius: "16px",
      textAlign: "center",
      boxShadow: "0 0 30px rgba(0,210,255,0.3)"
    },
    title: {
      color: "#FF4FA3",
      marginBottom: "10px"
    },
    text: {
      color: "#EDEDED",
      marginBottom: "20px"
    },
    input: {
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #00D2FF",
      background: "#EDEDED",
      color: "#1A0033",
      marginBottom: "20px",
      width: "100%",
      cursor: "pointer"
    },
    button: {
      background: "#6A00F4",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "bold",
      width: "100%"
    }
  };

  return (
    <>
    <Head>
      <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
    </Head>

      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gtag.GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      <>
        {showAgeGate && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h2 style={styles.title}>Age Verification</h2>
              <p style={styles.text}>You must be 18+ to enter</p>

              <div style={{ marginBottom: "20px" }}>
                <button
                  onClick={() => {
                    setSelectedAnswer(true);
                  }}
                  style={{
                    ...styles.button,
                    marginBottom: "10px",
                    background: selectedAnswer === true ? "#FF4FA3" : "#241238",
                  }}
                >
                  Yes, I am 18+
                </button>

                <button
                  onClick={() => {
                    setSelectedAnswer(false);
                  }}
                  style={{
                    ...styles.button,
                    background: selectedAnswer === false ? "#7C4DFF" : "#241238",
                  }}
                >
                  No, I am under 18
                </button>
              </div>

              <button onClick={handleAgeSubmit} style={styles.button}>
                Enter
              </button>
            </div>
          </div>
        )}
        <Component {...pageProps} />
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </>
    </>
  );
}

export default MyApp;
