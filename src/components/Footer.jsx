import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer({ onOpenAbout, onOpenPrivacy, onOpenTerms }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-section">
          <div className="footer-brand-title">
            <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>TempSumanMail &copy; {new Date().getFullYear()} &mdash; Anonymous Disposable Mail Broker</span>
          </div>

          <nav className="footer-nav-links" aria-label="Footer Navigation">
            <button type="button" className="footer-link-btn" onClick={onOpenAbout}>
              About Us
            </button>
            <span className="footer-link-dot">&bull;</span>
            <button type="button" className="footer-link-btn" onClick={onOpenPrivacy}>
              Privacy Policy
            </button>
            <span className="footer-link-dot">&bull;</span>
            <button type="button" className="footer-link-btn" onClick={onOpenTerms}>
              Terms &amp; Conditions
            </button>
          </nav>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-credit">
            <span>Designed &amp; Developed with &#10084;&#65039; for Pro Users by</span>
            <a
              href="https://sumanonline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit-link"
            >
              SumanOnline.Com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
