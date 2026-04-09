import Head from "next/head";
import React from "react";
import Header from "../../components/Header";
import LeftHandSide from "../../components/LeftHandSide";
import RightHandSide from "../../components/RightHandSide";
import { supabase } from "../../utils/supabaseClient";

const DetailsPage = ({ post }) => {
  const title = post?.caption
    ? `${post.caption} | WhosUp`
    : "Watch viral videos on WhosUp";

  const description =
    post?.caption ||
    "Watch and discover viral short videos on WhosUp.";

  const videoUrl = post?.video_url || "";
  const pageUrl = `https://whosup.fun/posts/${post?.id}`;

  return (
    <div className="detail-page-wrapper">
      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image:alt" content={post?.caption || "WhosUp posts"} />
        <meta property="og:site_name" content="WhosUp" />

        <meta
          property="og:image"
          content={post?.thumbnail_url || "https://whosup.fun/default-preview.jpg"}
        />

        <meta
          property="og:image:secure_url"
          content={post?.thumbnail_url || "https://whosup.fun/default-preview.jpg"}
        />

        <meta property="og:image:type" content="image/jpeg" />

        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta
          name="twitter:image"
          content={post?.thumbnail_url || "https://whosup.fun/default-preview.jpg"}
        />

        <meta name="twitter:image:src" content={post?.thumbnail_url} />
        <link
          rel="icon"
          href="https://th.bing.com/th/id/R.67bc88bb600a54112e8a669a30121273?rik=vsc22vMfmcSGfg&pid=ImgRaw&r=0"
        />
      </Head>

      <Header />

      <main>
        <LeftHandSide />
        <RightHandSide />
      </main>
    </div>
  );
};

export async function getServerSideProps({ params }) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return { notFound: true };
  }
  return {
    props: {
      post: data,
    },
  };
}

export default DetailsPage;
