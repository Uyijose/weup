import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function Advertise() {
  return (
    <div className="legal-page">
      <Head>
        <title>Advertise on WhosUp</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>Advertise on WhosUp</h1>

        <ul>
          <li>Display banner ads</li>
          <li>Native advertising placements</li>
          <li>In-video ads</li>
          <li>Sponsored content campaigns</li>
        </ul>

        <p>Advertising inquiries: ads@whosup.fun</p>
      </div>
    </div>
  );
}
