import Head from "next/head";
import React from "react";

import Header from "../../components/Header";
import LeftHandSide from "../../components/LeftHandSide";
import DetailFeed from "../../components/detailsPage/DetailFeed";

const DetailsPage = () => {
  console.log("Detail page mounted");

  return (
    <div className="detail-page-wrapper">
      <Head>
        <title>Whosup</title>
        <meta name="description" content="WhosUp is a modern short-form video platform for discovering and sharing viral moments from creators around the world." />
        <link
          rel="icon"
          href="https://th.bing.com/th/id/R.67bc88bb600a54112e8a669a30121273?rik=vsc22vMfmcSGfg&pid=ImgRaw&r=0"
        />
      </Head>

      <Header />

      <main>
        <LeftHandSide />

        <div className="right">
          <DetailFeed />
        </div>
      </main>
    </div>
  );
};

export default DetailsPage;
