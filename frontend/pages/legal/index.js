import Head from "next/head";
import LegalHeader from "../../components/legal/LegalHeader";

export default function LegalPage() {
  return (
    <div className="legal-page">
      <Head>
        <title>WhosUp | Privacy & Terms</title>
        <meta
          name="description"
          content="WhosUp Privacy Policy and Terms of Service"
        />
      </Head>

      <LegalHeader />

      <div className="legal-container">
        <h1>WhosUp Platform Legal Policies</h1>
        <p className="legal-updated">Last Updated: 2026-03-12</p>

        {/* PRIVACY POLICY */}
        <section>
          <h2>1. Privacy Policy</h2>
          <p>
            WhosUp (whosup.fun) respects the privacy of its users. This Privacy
            Policy explains how information is collected, used, and protected.
          </p>

          <h3>Information We Collect</h3>
          <ul>
            <li>Account information such as email and username</li>
            <li>Usage data including views, interactions, and time spent</li>
            <li>Device and technical data (IP, browser, OS)</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h3>How We Use Information</h3>
          <p>
            Information is used to operate the platform, improve features,
            analyze usage trends, prevent abuse, and enhance user experience.
          </p>

          <h3>Analytics & Advertising</h3>
          <p>
            WhosUp may use third-party analytics and advertising services. These
            services may use cookies or similar technologies.
          </p>

          <h3>Data Security</h3>
          <p>
            Reasonable security measures are applied, but no system is 100%
            secure.
          </p>

          <h3>Age Requirement</h3>
          <p>Users must be at least 18 years old to use the platform.</p>
        </section>

        {/* TERMS */}
        <section>
          <h2>2. Terms of Service</h2>

          <h3>Platform Usage</h3>
          <p>
            Users may browse, watch, and upload short-form video content. Illegal
            or harmful activities are strictly prohibited.
          </p>

          <h3>User Accounts</h3>
          <p>
            Users are responsible for maintaining the confidentiality of their
            login credentials and all activity under their account.
          </p>

          <h3>User-Generated Content</h3>
          <p>
            Users retain ownership of content they upload but grant WhosUp a
            non-exclusive license to display, distribute, and promote the
            content.
          </p>

          <h3>Account Suspension</h3>
          <p>
            WhosUp reserves the right to remove content or suspend accounts that
            violate platform policies.
          </p>
        </section>

        {/* CONTENT POLICY */}
        <section>
          <h2>3. Content Policy</h2>

          <h3>Allowed Content</h3>
          <ul>
            <li>Original and creative videos</li>
            <li>Entertainment, commentary, and reactions</li>
          </ul>

          <h3>Prohibited Content</h3>
          <ul>
            <li>Illegal or copyrighted material</li>
            <li>Harassment, threats, or exploitation</li>
            <li>Non-consensual or harmful content</li>
          </ul>
        </section>

        {/* DMCA */}
        <section>
          <h2>4. Copyright / DMCA Policy</h2>
          <p>
            If you believe content infringes copyright, contact us with details
            so the content can be reviewed and removed if necessary.
          </p>
        </section>

        {/* CONTACT */}
        <section>
          <h2>5. Contact Information</h2>
          <p>Email: contact@whosup.fun</p>
          <p>Website: https://whosup.fun</p>
        </section>
      </div>
    </div>
  );
}
