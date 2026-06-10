import Head from "next/head";
import React, { useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/router';

import Header from "../../components/Header";
import LeftHandSide from "../../components/LeftHandSide";
import DetailFeed from "../../components/detailsPage/DetailFeed";

const DetailsPage = ({ ogPost }) => {

  const router = useRouter();
  return (
    <div className="detail-page-wrapper">
      <Head>
        <title>
          {ogPost?.caption
            ? ogPost.caption.length > 60
              ? ogPost.caption.slice(0, 60) + "..."
              : ogPost.caption
            : "Post | WeUp"}
        </title>
        <meta property="og:site_name" content="WeUp" />

        <meta property="og:title" content="WeUp Posts" />

        <meta
          property="og:description"
          content={ogPost?.caption || "Watch this video on WeUp"}
        />

        <meta
          property="og:image"
          content={ogPost?.thumbnail_url || "https://whosup.fun/whosup-icon.PNG"}
        />

        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="WeUp Posts"
        />
        <meta
          name="twitter:description"
          content={ogPost?.caption || "Watch this video on WeUp"}
        />
        <meta
          name="twitter:image"
          content={ogPost?.thumbnail_url || "https://whosup.fun/whosup-icon.PNG"}
        />

        <meta
          name="description"
          content="WeUp is a modern short-form video platform for discovering and sharing viral moments from creators around the world."
        />

        <link
          rel="icon"
          href="https://whosup.fun/favicon.ico"
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

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, caption, thumbnail_url")
    .eq("id", id)
    .single();
  const partNumber = context.query.part ? Number(context.query.part) : null;
  let finalCaption = post?.caption || null;

  if (partNumber) {
    const { data: videoPart, error: partError } = await supabase
      .from("video_parts")
      .select("part_number")
      .eq("post_id", id)
      .eq("part_number", partNumber)
      .single();
    if (videoPart?.part_number && finalCaption) {
      finalCaption = `${finalCaption} (part ${videoPart.part_number})`;
    }
  }
  let caption = post?.caption || null;

  return {
    props: {
      ogPost: post
        ? {
            ...post,
            caption: finalCaption
          }
        : null,
    },
  };
}
