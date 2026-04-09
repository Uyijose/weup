import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function Contact() {
  return (
    <div className="legal-page">
      <Head>
        <title>Contact WhosUp</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>Contact WhosUp</h1>

        <p>General inquiries: contact@whosup.fun</p>
        <p>Media inquiries: press@whosup.fun</p>
        <p>Advertising inquiries: ads@whosup.fun</p>

        <p>
          For support or account issues, please visit the Help page.
        </p>
      </div>
    </div>
  );
}
