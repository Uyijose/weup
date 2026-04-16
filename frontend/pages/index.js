import Explore from "./explore/index";
import Head from "next/head";

export default function Home() {
  const siteTitle = "weup - Discover Viral Videos";
  const siteDescription = "Watch, share, and discover trending short videos on weup.";
  const siteUrl = "https://www.weup.fun/";
  const siteImage = "https://weup.fun/weup-icon.PNG";
  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="weup" />
        <meta property="og:image" content={siteImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={siteImage} />
      </Head>

      <Explore />
    </>
  );
}
