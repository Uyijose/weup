import Link from "next/link";

export default function LegalHeader() {
  return (
    <header className="legal-header">
      <div className="legal-header-inner">
        <Link href="/">
          <span className="legal-logo">WhosUp</span>
        </Link>

        <nav className="legal-nav">
          <Link href="/legal">Privacy & Terms</Link>
        </nav>
      </div>
    </header>
  );
}
