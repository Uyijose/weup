import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function Developers() {
  return (
    <div className="legal-page">
      <Head>
        <title>Developers</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>Developers</h1>

        <p>
          weup is working toward building APIs and integration tools.
        </p>

        <ul>
          <li>Content integration APIs</li>
          <li>Analytics access</li>
          <li>Creator tools</li>
          <li>Advertising integrations</li>
        </ul>

        <p>
          Developer documentation will be published here.
        </p>
      </div>
    </div>
  );
}
