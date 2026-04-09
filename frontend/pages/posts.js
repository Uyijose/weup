import Head from "next/head";
import { useState } from "react";

import Header from "../components/Header";
import LeftHandSide from "../components/LeftHandSide";
import RightHandSide from "../components/RightHandSide";

export default function Posts() {
  const [mobileMenu, setMobileMenu] = useState(false);
  return (
    <div>
      <Head>
        <title>WhosUp - Posts</title>
        <meta name="description" content="All posts feed" />
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
        <RightHandSide />
      </main>
    </div>
  );
}
