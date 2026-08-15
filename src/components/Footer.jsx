import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer({ onOpenAbout, onOpenPrivacy, onOpenTerms }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main-row">
          <div className="footer-brand-title">
            <span>&copy; {new Date().getFullYear()} <b>TempSumanMail</b></span>
            <ShieldCheck size={16} className="footer-shield-icon" />
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

        <div className="footer-bottom-divider"></div>

        <div className="footer-credit">
          <span>Designed &amp; Developed with &#10084;&#65039; by</span>
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
    </footer>
  );
}
