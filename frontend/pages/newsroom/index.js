import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function Newsroom() {
  return (
    <div className="legal-page">
      <Head>
        <title>weup Newsroom</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>weup Newsroom</h1>

        <p>Welcome to the official newsroom for weup.</p>

        <ul>
          <li>New product features</li>
          <li>Creator announcements</li>
          <li>Platform milestones</li>
          <li>Community highlights</li>
          <li>Partnerships and collaborations</li>
        </ul>

        <p>
          Media partners can reach out through the Contact page.
        </p>
      </div>
    </div>
  );
}
