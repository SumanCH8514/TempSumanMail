import React from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, AlertTriangle } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';

export function TermsModal({ isOpen, onClose }) {
  useLockBodyScroll(isOpen);
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop anim-fade-in" onClick={onClose}>
      <div className="modal-card legal-modal anim-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '30px', height: '30px' }}>
              <FileText size={16} />
            </div>
            <h2 className="modal-title">Terms &amp; Conditions</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="legal-content-scroll">
          <div className="policy-summary-box" style={{ borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.06)' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            <span>
              <strong>Intended Use Notice:</strong> TempSumanMail is designed strictly for receiving non-sensitive verification emails, one-time passwords (OTP), and software testing. Do not use for banking, legal, or permanent sensitive accounts.
            </span>
          </div>

          <section className="legal-section">
            <h3 className="legal-heading">1. Acceptance of Terms</h3>
            <p>
              By accessing or utilizing the services provided by TempSumanMail ("the Service"), you agree to be bound by these Terms and Conditions. If you disagree with any segment of these terms, you should terminate usage immediately.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">2. Disposable Nature of Service</h3>
            <p>
              All email addresses and mailboxes generated through TempSumanMail are temporary, public in nature, and ephemeral. We do not guarantee continuous retention or permanent retrieval of any email message or mailbox address.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">3. Prohibited Misuse</h3>
            <p>
              You agree not to utilize the Service for any illicit or prohibited activities, including but not limited to:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.4rem', lineHeight: '1.6', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>Engaging in fraud, phishing scams, or unauthorized identity theft.</li>
              <li>Receiving stolen financial data, illegal material, or regulated secrets.</li>
              <li>Performing high-concurrency automated denial-of-service (DoS) attacks on our edge infrastructure.</li>
              <li>Attempting to bypass security barriers or exploit upstream providers.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">4. Limitation of Liability</h3>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. TempSumanMail and SumanOnline shall not be held liable for any data loss, delivery failure, missed verification, or consequential damages arising from the use of this service.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">5. Modifications &amp; Termination</h3>
            <p>
              We reserve the right to alter, throttle, or discontinue any aspect of the Service, rate limits, or supported domains at any time without prior notice.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Effective Date: August 2026
            </p>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            I Understand
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
