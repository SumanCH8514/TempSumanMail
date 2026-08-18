import React from 'react';
import { createPortal } from 'react-dom';
import { X, Command, Keyboard } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';

export function ShortcutsModal({ isOpen, onClose }) {
  useLockBodyScroll(isOpen);
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'C', description: 'Copy active email address to clipboard' },
    { key: 'R', description: 'Refresh inbox and check for incoming mail' },
    { key: 'N', description: 'Generate a new random email inbox' },
    { key: 'U', description: 'Customize username and domain' },
    { key: 'Q', description: 'Display mobile QR Code' },
    { key: '/', description: 'Focus search bar in inbox' },
    { key: 'Esc', description: 'Close active modal or exit email reader' }
  ];

  return createPortal(
    <div className="modal-backdrop anim-fade-in" onClick={onClose}>
      <div className="modal-card anim-scale-in" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Keyboard size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {shortcuts.map((sc, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{sc.description}</span>
              <kbd className="kbd-badge">{sc.key}</kbd>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
