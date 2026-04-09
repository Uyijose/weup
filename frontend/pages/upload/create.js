import React from "react";
import Head from "next/head";
import { useState } from "react";
import CreateVideo from "../../components/CreateVideo";
import Header from "../../components/Header";
import LeftHandSide from "../../components/LeftHandSide";

const Create = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      <Head>
        <title>WhosUp</title>
        <meta name="description" content="WhosUp is a modern short-form video platform for discovering and sharing viral moments from creators around the world." />
        <link
          rel="icon"
          href="https://th.bing.com/th/id/R.67bc88bb600a54112e8a669a30121273?rik=vsc22vMfmcSGfg&pid=ImgRaw&r=0"
        />
      </Head>

      <Header
        isOwner={true}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

      <main>
        <LeftHandSide
          mobileMenu={mobileMenu}
          setMobileMenu={setMobileMenu}
        />

        <div className="create-page-container">
          <CreateVideo />
        </div>
      </main>
    </>
  );
};

export default Create;
