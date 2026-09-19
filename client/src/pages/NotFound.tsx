/*
  404 — same Signal / System language as the home page: ink surface, oversized
  outline numeral, mono annotations, one lime action.
*/
import { useEffect } from "react";
import { ArrowUpRight, Undo2 } from "lucide-react";
import { useLocation } from "wouter";

const railLinks: Array<[string, string]> = [
  ["/#about", "About"],
  ["/#projects", "Projects"],
  ["/#experiments", "Experiments"],
  ["/#contact", "Contact"],
];

export default function NotFound() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = "404 — page not found / Praveen";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="page-shell notfound section-dark section-noise">
      <div className="max-frame notfound-inner">
        <div className="notfound-top eyebrow">
          <span>
            <span className="at-annotation">P/</span> Signal lost
          </span>
          <span>Error 404</span>
        </div>

        <div className="notfound-body">
          <p className="notfound-code display" aria-hidden="true">
            <span>4</span>
            <span className="outline-type">0</span>
            <span>4</span>
          </p>

          <div className="notfound-copy">
            <h1 className="display display-sm notfound-title">
              This page
              <br />
              <span className="outline-type">doesn&apos;t</span> exist.
            </h1>
            <p className="notfound-note">
              The address didn&apos;t match anything here. It may have moved, or the
              link may have been mistyped — either way, everything worth seeing is
              back on the main page.
            </p>

            <div className="notfound-actions">
              <button
                className="signal-button"
                type="button"
                onClick={() => setLocation("/")}
                data-magnetic
              >
                Back to start
                <span className="button-arrow">
                  <Undo2 size={14} />
                </span>
              </button>
              <a className="text-link" href="mailto:praveen@3dturner.com">
                Report a broken link
              </a>
            </div>

            <nav className="notfound-rail" aria-label="Jump to a section">
              {railLinks.map(([href, label], index) => (
                <a href={href} key={href}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {label}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="notfound-foot eyebrow">
          <span>Praveen / full-stack developer</span>
          <span>India / remote worldwide</span>
        </div>
      </div>
    </div>
  );
}
