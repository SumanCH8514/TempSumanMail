import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { X, QrCode as QrIcon } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';

export function QrCodeModal({ isOpen, onClose }) {
  const { session } = useMail();
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (isOpen && session?.address) {
      QRCode.toDataURL(`mailto:${session.address}`, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(() => {});
    }
  }, [isOpen, session?.address]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop anim-fade-in" onClick={onClose}>
      <div className="modal-card anim-scale-in" style={{ textAlign: 'center', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrIcon size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>Scan Address</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code for temporary email" style={{ width: '220px', height: '220px', display: 'block' }} />
          ) : (
            <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>Generating...</span>
            </div>
          )}
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
          {session?.address}
        </p>

        <button className="btn-secondary" onClick={onClose} style={{ width: '100%' }}>
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}
