import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Mail, Zap, Users, Globe, Lock } from 'lucide-react';

export function AboutUsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop anim-fade-in" onClick={onClose}>
      <div className="modal-card legal-modal anim-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '30px', height: '30px' }}>
              <Mail size={16} />
            </div>
            <h2 className="modal-title">About TempSumanMail</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="legal-content-scroll">
          <section className="legal-section">
            <h3 className="legal-heading">Our Mission</h3>
            <p>
              TempSumanMail was created to provide developers, students, QA engineers, and privacy-conscious users with a fast, completely free, and secure disposable email platform. We believe personal inboxes should remain free from marketing clutter, phishing trackers, and spam data harvesting.
            </p>
          </section>

          <section className="legal-section">
            <h3 className="legal-heading">How It Works</h3>
            <p>
              Unlike traditional email services requiring signups and personal verification, TempSumanMail provisions an ephemeral mailbox the second you open the website. The client communicates with high-availability edge proxy clusters, aggregating mail directly from decentralized disposable networks.
            </p>
          </section>

          <div className="feature-highlight-grid">
            <div className="feature-item">
              <Zap size={18} style={{ color: 'var(--accent-cyan)' }} />
              <div>
                <strong>Zero Registration</strong>
                <p>No passwords, phone numbers, or identity checks required.</p>
              </div>
            </div>

            <div className="feature-item">
              <Lock size={18} style={{ color: 'var(--accent-indigo)' }} />
              <div>
                <strong>Ephemeral Storage</strong>
                <p>Emails and tokens automatically dissolve without permanent databases.</p>
              </div>
            </div>

            <div className="feature-item">
              <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
              <div>
                <strong>XSS &amp; Sandbox Protection</strong>
                <p>All HTML content is strictly sanitized with isolated iframe rendering.</p>
              </div>
            </div>

            <div className="feature-item">
              <Globe size={18} style={{ color: 'var(--accent-purple)' }} />
              <div>
                <strong>Multi-Edge Resilience</strong>
                <p>Automatic failover across multiple upstream providers ensures 99.9% uptime.</p>
              </div>
            </div>
          </div>

          <section className="legal-section">
            <h3 className="legal-heading">Crafted by SumanOnline</h3>
            <p>
              TempSumanMail is maintained as a public utility project designed and developed by{' '}
              <a href="https://sumanonline.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                SumanOnline.Com
              </a>
              . Our goal is to create modern, responsive, and robust tools accessible to everyone worldwide.
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
