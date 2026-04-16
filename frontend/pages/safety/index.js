import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function Safety() {
  return (
    <div className="legal-page">
      <Head>
        <title>Safety on weup</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>Safety on weup</h1>

        <p>
          We are committed to maintaining a safe and responsible environment.
        </p>

        <p>
          Users are encouraged to report harmful or illegal content.
        </p>

        <p>
          Reports are reviewed promptly using moderation systems and internal
          review processes.
        </p>
      </div>
    </div>
  );
}
