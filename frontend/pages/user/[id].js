import React, { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../../components/Header";
import UserProfile from "../../components/UserProfile";
import LeftHandSide from "../../components/LeftHandSide";
import { useAuthStore } from "../../stores/authStore";

const User = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const authUser = useAuthStore(state => state.user);
  const hydrateAuth = useAuthStore(state => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
  }, []);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div>
      <Head>
        <title>
          {authUser
            ? authUser.full_name
              ? `${authUser.full_name} | weup`
              : `${authUser.username} | weup`
            : "weup"}
        </title>
        <meta
          name="description"
          content="weup is a modern short-form video platform for discovering and sharing viral moments from creators around the world."
        />
        <link
          rel="icon"
          href="https://th.bing.com/th/id/R.67bc88bb600a54112e8a669a30121273?rik=vsc22vMfmcSGfg&pid=ImgRaw&r=0"
        />
      </Head>
      {console.log("Page title set to:", authUser?.full_name || authUser?.username || "weup")}

      <Header
        mobileMenu={mobileMenu}
        setMobileMenu={(val) => {
          setMobileMenu(val);
        }}
      />

      {isMobile && (
        <LeftHandSide
          mobileMenu={mobileMenu}
          setMobileMenu={(val) => {
            setMobileMenu(val);
          }}
        />
      )}

      {authUser && <UserProfile />}
    </div>
  );
};

export default User;
