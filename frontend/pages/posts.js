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
        <title>WeUp - Posts</title>

        <meta name="description" content="Browse all posts on WeUp." />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="WeUp - Posts" />
        <meta property="og:description" content="Browse all posts on WeUp." />
        <meta property="og:url" content="https://weup-dun.vercel.app/posts" />
        <meta property="og:image" content="https://whosup.fun/whosup-icon.PNG" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://whosup.fun/whosup-icon.PNG" />

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
