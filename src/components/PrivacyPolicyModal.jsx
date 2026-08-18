import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';

export function PrivacyPolicyModal({ isOpen, onClose }) {
  useLockBodyScroll(isOpen);
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop anim-fade-in" onClick={onClose}>
      <div className="modal-card legal-modal anim-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '30px', height: '30px' }}>
              <Lock size={16} />
            </div>
            <h2 className="modal-title">Privacy Policy</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="legal-content-scroll">
          <div className="policy-summary-box">
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            <span>
              <strong>Zero Data Harvesting Policy:</strong> We do not log IP addresses, sell email addresses, inject tracking pixels, or collect personally identifiable information (PII).
            </span>
          </div>

          <section className="legal-section">
            <h3 className="legal-heading">1. Information We Do Not Collect</h3>
            <p>
              When utilizing TempSumanMail, you are never asked to submit your real name, physical address, phone number, payment details, or permanent email. We do not maintain user profile databases or browser fingerprinting trackers.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">2. Ephemeral Storage &amp; Message Retention</h3>
            <p>
              Messages received by your disposable address are held in memory buffers solely to facilitate real-time viewing. Once you click "Destroy", close your session, or allow the 24-hour inactivity window to elapse, the mailbox association is purged.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">3. Client-Side Storage</h3>
            <p>
              We utilize browser <code>localStorage</code> purely to preserve your active session token and custom user preferences (such as Dark/Light theme, sound alert status, and read email markers) on your own device. This data never leaves your browser.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">4. Email Sanitization &amp; Security</h3>
            <p>
              To protect your local environment from malicious web payloads, incoming HTML email messages are sanitized via strict security filters (DOMPurify) and isolated within sandboxed document contexts, neutralizing tracking web beacons and scripts.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">5. Third-Party Edge Aggregators</h3>
            <p>
              TempSumanMail coordinates with public disposable mail providers (including mail.tm, mail.gw, and Guerrilla Mail). Upstream networks process standard SMTP transmissions in accordance with global mail protocols.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">6. Policy Updates</h3>
            <p>
              Any operational or security updates to this privacy policy will be reflected on this page with immediate effect.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Last revised: August 2026
            </p>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
