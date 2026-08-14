import React, { useState } from 'react';
import { Copy, Check, RefreshCw, UserCheck, QrCode, Trash2, ShieldCheck } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';
import { CustomAddressModal } from './CustomAddressModal.jsx';
import { QrCodeModal } from './QrCodeModal.jsx';

export function AddressBar() {
  const {
    session,
    loading,
    refreshing,
    pollCountdown,
    createRandomInbox,
    fetchMessages,
    deleteCurrentInbox,
    addToast
  } = useMail();

  const [copied, setCopied] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleCopy = async () => {
    if (!session?.address) return;
    try {
      await navigator.clipboard.writeText(session.address);
      setCopied(true);
      addToast('Address copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      addToast('Failed to copy address', 'error');
    }
  };

  const circumference = 2 * Math.PI * 9;
  const strokeDashoffset = circumference - (pollCountdown / 10) * circumference;

  return (
    <div className="address-box-card anim-slide-up">
      <div className="address-main-row">
        <div className="address-text-group">
          <div className="address-shield-icon">
            <ShieldCheck size={18} />
          </div>
          <span className="address-string" title={session?.address || 'Provisioning...'}>
            {loading ? 'Provisioning temporary address...' : session?.address || 'No active address'}
          </span>
        </div>

        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          disabled={loading || !session?.address}
          title="Copy address (C)"
          aria-label="Copy address"
        >
          {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
          <kbd className="copy-kbd">C</kbd>
        </button>
      </div>

      <div className="address-actions-bar">
        <div className="actions-cluster">
          <button
            className="action-btn"
            onClick={() => setCustomModalOpen(true)}
            disabled={loading}
            title="Choose custom username (U)"
          >
            <UserCheck size={14} />
            <span>Customize</span>
            <kbd className="action-kbd">U</kbd>
          </button>

          <button
            className="action-btn"
            onClick={() => createRandomInbox()}
            disabled={loading}
            title="Generate new random address (N)"
          >
            <RefreshCw size={14} className={loading ? 'anim-spin-slow' : ''} />
            <span>Randomize</span>
            <kbd className="action-kbd">N</kbd>
          </button>

          <button
            className="action-btn"
            onClick={() => setQrModalOpen(true)}
            disabled={!session?.address}
            title="Scan QR on mobile (Q)"
          >
            <QrCode size={14} />
            <span>QR Code</span>
            <kbd className="action-kbd">Q</kbd>
          </button>

          <button
            className="action-btn danger"
            onClick={deleteCurrentInbox}
            disabled={loading || !session?.token}
            title="Destroy this mailbox session"
          >
            <Trash2 size={14} />
            <span>Destroy</span>
          </button>
        </div>

        <div className="refresh-indicator-group">
          <button
            className="icon-btn"
            style={{ width: '32px', height: '32px' }}
            onClick={() => fetchMessages(true)}
            disabled={refreshing || !session?.token}
            title="Check mail now (R)"
            aria-label="Check mail"
          >
            <RefreshCw size={14} className={refreshing ? 'anim-spin-slow' : ''} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <svg width="20" height="20" viewBox="0 0 22 22">
              <circle
                cx="11"
                cy="11"
                r="9"
                stroke="var(--border-subtle)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="11"
                cy="11"
                r="9"
                stroke="var(--accent-cyan)"
                strokeWidth="2"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 11 11)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Polling in <strong className="countdown-badge">{String(pollCountdown).padStart(2, '0')}s</strong>
            </span>
          </div>
        </div>
      </div>

      <CustomAddressModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
      />

      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}
