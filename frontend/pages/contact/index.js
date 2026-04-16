import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function Contact() {
  return (
    <div className="legal-page">
      <Head>
        <title>Contact weup</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>Contact weup</h1>

        <p>General inquiries: contact@weup.fun</p>
        <p>Media inquiries: press@weup.fun</p>
        <p>Advertising inquiries: ads@weup.fun</p>

        <p>
          For support or account issues, please visit the Help page.
        </p>
      </div>
    </div>
  );
}
