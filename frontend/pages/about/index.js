import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function About() {
  return (
    <div className="legal-page">
      <Head>
        <title>About WhosUp</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>About WhosUp</h1>

        <p>
          WhosUp is a modern short-form video platform built for discovering and
          sharing viral moments from around the internet.
        </p>

        <p>
          Our mission is to make it easy for people to watch, share, and
          discover engaging short videos from creators and communities around
          the world.
        </p>

        <p>
          WhosUp focuses on quick, entertaining clips designed for fast
          discovery and easy viewing.
        </p>

        <p>
          We are continuously improving the platform with new tools, features,
          and creator opportunities.
        </p>

        <p>
          Our goal is to build a global hub for short-form entertainment and
          viral culture.
        </p>

        <p>Visit us at https://whosup.fun</p>
      </div>
    </div>
  );
}
