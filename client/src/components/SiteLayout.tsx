/*
  SiteLayout — shared layout with navbar and footer.
  Uses wouter's useLocation for active route detection.
*/
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import motion from "framer-motion";

const navLinks = [
  { id: "about", label: "About", num: "01", to: "/about" as const },
  { id: "services", label: "Services", num: "02", to: "/#services" as const },
  { id: "projects", label: "Projects", num: "03", to: "/projects" as const },
  { id: "experiments", label: "Experiments", num: "04", to: "/#experiments" as const },
  { id: "contact", label: "Contact", num: "05", to: "/contact" as const },
];

const footerLinks = [
  { href: "mailto:praveenmanoharan.dev@gmail.com", label: "Email" },
  { href: "https://github.com/Praveenmanoharand", label: "GitHub" },
  { href: "https://proposal-ai-inky.vercel.app/", label: "ProposeAI" },
  { href: "https://chatbot-ai-one-green.vercel.app/", label: "Aura AI" },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="page-shell">
      {/* Skip link */}
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      {/* Header / Nav */}
      <header className={scrolled ? "site-nav is-scrolled" : "site-nav"}>
        <span className="site-nav-scan" aria-hidden="true" />
        <div className="max-frame nav-inner">
          <a
            className="brand-lockup"
            href="/"
            aria-label="Praveen — back to start"
          >
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark-glow" />
              <span className="brand-mark-text">P/</span>
            </span>
            <span className="brand-wordmark">
              <span className="brand-wordmark-name">Praveen</span>
              <span className="brand-wordmark-sep" aria-hidden="true">
                <span className="brand-wordmark-dot" />
              </span>
              <span className="brand-wordmark-role">full-stack developer</span>
            </span>
          </a>

          {/* Nav links */}
          <nav className="nav-links" aria-label="Primary">
            {navLinks.map(({ id, label, num, to }) => {
              const isCurrent = location === to || location.startsWith(to.split("?")[0]);
              return (
                <a
                  className={isCurrent ? "nav-link is-current" : "nav-link"}
                  href={to}
                  key={id}
                  aria-current={isCurrent ? "true" : undefined}
                  data-magnetic
                >
                  <span className="nav-link-num" aria-hidden="true">
                    {num}
                  </span>
                  <span className="nav-link-label">{label}</span>
                  {isCurrent && <span className="nav-link-active-dot" aria-hidden="true" />}
                </a>
              );
            })}
          </nav>

          {/* Right meta cluster */}
          <div className="nav-meta">
            <p className="nav-status">
              <span className="status-dot" aria-hidden="true" />
              <span className="nav-status-text">Available</span>
              <span className="nav-status-sep" aria-hidden="true">·</span>
              <span className="nav-status-time">Q4 2026</span>
            </p>
          </div>

          {/* Mobile menu button */}
          <button
            className="mobile-menu"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <>
                <X size={15} /> Close
              </>
            ) : (
              <>
                <Menu size={15} /> Menu
              </>
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="nav-mobile" aria-label="Mobile menu">
            {navLinks.map(({ id, label, num, to }) => {
              const isCurrent = location === to || location.startsWith(to.split("?")[0]);
              return (
                <a
                  className={isCurrent ? "nav-link is-current" : "nav-link"}
                  href={to}
                  key={id}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  <span className="nav-link-num" aria-hidden="true">
                    {num}
                  </span>
                  <span className="nav-link-label">{label}</span>
                </a>
              );
            })}
          </nav>
        )}

        {/* Progress bar */}
        <span className="nav-progress" style={{ width: "0%" }} aria-hidden="true" />
      </header>

      {/* Main content */}
      <main id="top">{children}</main>

      {/* Footer */}
      <footer className="section-dark site-footer">
        <div className="max-frame">
          <div className="footer-main">
            <div className="footer-signature">
              <div className="footer-mark" aria-hidden="true">
                <span className="footer-mark-text">P/</span>
              </div>
              <p className="footer-name">Praveen</p>
              <span className="footer-role">
                Full-stack developer / product builder
              </span>
            </div>

            <div>
              <h2 className="footer-heading">Live work</h2>
              <ul className="footer-list">
                {footerLinks.map(({ href, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {label}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="footer-heading">Contact</h2>
              <ul className="footer-list">
                <li>
                  <a href="mailto:praveenmanoharan.dev@gmail.com">
                    praveenmanoharan.dev@gmail.com
                  </a>
                </li>
                <li>India / remote worldwide</li>
                <li>UTC +05:30</li>
              </ul>
            </div>
          </div>

          {/* Shape strip */}
          <div className="shape-strip" aria-hidden="true">
            <span className="shape-cross">×</span>
            <span className="shape-dots">•••</span>
            <span className="shape-blob">●</span>
            <span className="shape-ring">○</span>
            <span className="shape-zig">〰</span>
            <span className="shape-bow">◆</span>
            <span className="shape-triangle">△</span>
            <span className="shape-pink">◎</span>
          </div>

          {/* Footer bottom */}
          <div className="footer-bottom">
            <span>© 2026 Praveen / Built with care</span>
            <span>
              <strong>P/</strong> Signal / System
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}