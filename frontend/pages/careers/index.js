import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function Careers() {
  return (
    <div className="legal-page">
      <Head>
        <title>Careers at WhosUp</title>
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>Careers at WhosUp</h1>

        <p>
          WhosUp is building the future of short-form video discovery, connecting
          creators and audiences worldwide.
        </p>
        <p>
          We’re always interested in talented individuals who want to help shape
          the platform and grow with us.
        </p>

        <div style={{ margin: "24px 0", padding: "16px", background: "#FF4FA3", color: "#1A0033", fontWeight: "700", fontSize: "1.2rem", textAlign: "center", borderRadius: "8px" }}>
          No open positions yet. Keep in touch!
        </div>

        <p>
          You can stay updated or reach out through the Contact page for future
          opportunities.
        </p>
      </div>
    </div>
  );
}
