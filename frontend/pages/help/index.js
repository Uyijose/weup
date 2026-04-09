import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function Help() {
  return (
    <div className="legal-page">
      <Head>
        <title>Help Center</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>Help Center</h1>

        <ul>
          <li>Account access</li>
          <li>Uploading videos</li>
          <li>Reporting content</li>
          <li>Community guidelines</li>
          <li>Troubleshooting technical issues</li>
        </ul>

        <p>
          If you need further assistance, contact us via the Contact page.
        </p>
      </div>
    </div>
  );
}
