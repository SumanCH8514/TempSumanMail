import React, { useState } from 'react';
import { ArrowLeft, Trash2, Download, Paperclip, Code, FileText, Globe, Printer, Copy, Check, Star } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatRelativeTime, formatFileSize, getInitials } from '../utils/formatters.js';
import { sanitizeHtml, buildIframeSrcDoc } from '../utils/sanitizer.js';

export function MessageViewer({ message, onBack }) {
  const { deleteMessage, addToast, starredIds, toggleStar } = useMail();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('html');
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!message) return null;

  const isStarred = starredIds.includes(message.id);
  const initials = getInitials(message.fromName, message.fromAddress);
  const timeFormatted = formatRelativeTime(message.receivedAt);
  const sanitized = sanitizeHtml(message.html);
  const iframeDoc = buildIframeSrcDoc(sanitized || `<pre style="white-space: pre-wrap; font-family: sans-serif;">${message.text || 'No message content'}</pre>`, theme);

  const handleDelete = () => {
    deleteMessage(message.id);
    onBack();
  };

  const copyAddress = async (addr, label = 'Address') => {
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      addToast(`${label} copied to clipboard`, 'success');
    } catch (e) {
      addToast('Failed to copy address', 'error');
    }
  };

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(message.text || message.html || '');
      setCopiedRaw(true);
      addToast('Message text copied to clipboard', 'success');
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch (e) {
      addToast('Failed to copy', 'error');
    }
  };

  const handleDownloadEml = () => {
    const content = `From: ${message.from}\nTo: ${message.to || ''}\nSubject: ${message.subject}\nDate: ${message.receivedAt}\nMIME-Version: 1.0\nContent-Type: text/html; charset=utf-8\n\n${message.html || message.text || ''}`;
    const blob = new Blob([content], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(message.subject || 'email').replace(/[^a-z0-9]/gi, '_')}.eml`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded .eml file', 'info');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${message.subject || 'Email'}</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h2>${message.subject || '(No Subject)'}</h2>
            <p><strong>From:</strong> ${message.from}</p>
            <p><strong>Date:</strong> ${new Date(message.receivedAt).toLocaleString()}</p>
            <hr/>
            <div>${message.html || `<pre>${message.text}</pre>`}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const fromEmail = message.fromAddress || message.from;
  const toDisplay = message.to ? (message.to.includes('@') ? message.to.split('@')[0] : message.to) : 'me';

  return (
    <div className="reader-container anim-fade-in">
      <div className="reader-top-bar">
        <button
          className="reader-back-btn"
          onClick={onBack}
          title="Back to inbox (Esc)"
          aria-label="Back to inbox"
        >
          <div className="reader-back-icon-box">
            <ArrowLeft size={15} strokeWidth={2.4} />
          </div>
          <span className="reader-back-text">Back</span>
          <kbd className="reader-back-kbd">Esc</kbd>
        </button>

        <div className="reader-actions-group">
          <button
            className={`icon-btn ${isStarred ? 'starred-btn' : ''}`}
            onClick={() => toggleStar(message.id)}
            title={isStarred ? 'Unstar message' : 'Star message'}
            aria-label="Star email"
          >
            <Star
              size={15}
              fill={isStarred ? 'var(--accent-amber)' : 'none'}
              color={isStarred ? 'var(--accent-amber)' : 'currentColor'}
            />
          </button>

          <button
            className="icon-btn"
            onClick={handleCopyRaw}
            title="Copy message body"
            aria-label="Copy text"
          >
            {copiedRaw ? <Check size={15} /> : <Copy size={15} />}
          </button>

          <button
            className="icon-btn"
            onClick={handleDownloadEml}
            title="Download .EML file"
            aria-label="Download EML"
          >
            <Download size={15} />
          </button>

          <button
            className="icon-btn"
            onClick={handlePrint}
            title="Print email"
            aria-label="Print email"
          >
            <Printer size={15} />
          </button>

          <button
            className="icon-btn danger-icon-btn"
            onClick={handleDelete}
            title="Delete this message"
            aria-label="Delete email"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="reader-meta-header">
        <h2 className="reader-subject">{message.subject || '(No Subject)'}</h2>

        <div className="reader-sender-card">
          <div className="sender-avatar">
            {initials}
          </div>

          <div className="reader-sender-details">
            <div className="reader-sender-name-row">
              <span className="reader-from-name">{message.fromName || message.from}</span>
              <span className="reader-time-badge">{timeFormatted}</span>
            </div>

            <div className="reader-address-row">
              <button
                type="button"
                className="reader-addr-btn"
                onClick={() => copyAddress(fromEmail, 'Sender address')}
                title="Click to copy sender address"
              >
                {fromEmail}
              </button>
              <button
                type="button"
                className="reader-to-chip"
                onClick={() => copyAddress(message.to, 'Recipient address')}
                title={`Click to copy: ${message.to || 'Your address'}`}
              >
                to {toDisplay}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reader-tabs">
        <button
          className={`tab-btn ${activeTab === 'html' ? 'active' : ''}`}
          onClick={() => setActiveTab('html')}
        >
          <Globe size={14} />
          <span>HTML</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <FileText size={14} />
          <span>Plain Text</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          <Code size={14} />
          <span>Raw Source</span>
        </button>
      </div>

      <div className="reader-body-wrapper">
        {activeTab === 'html' && (
          <iframe
            className="email-iframe"
            title="Email content"
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            srcDoc={iframeDoc}
          />
        )}

        {activeTab === 'text' && (
          <div className="email-plaintext">
            {message.text || 'No plain text representation found in this email.'}
          </div>
        )}

        {activeTab === 'raw' && (
          <pre className="email-plaintext" style={{ maxHeight: '480px', overflow: 'auto' }}>
            {message.html || message.text || JSON.stringify(message, null, 2)}
          </pre>
        )}
      </div>

      {message.attachments && message.attachments.length > 0 && (
        <div className="attachments-section">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Paperclip size={14} />
            <span>Attachments ({message.attachments.length})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {message.attachments.map(att => (
              <a
                key={att.id}
                href={att.downloadUrl || '#'}
                download={att.filename}
                target="_blank"
                rel="noreferrer"
                className="attachment-chip"
              >
                <Download size={13} style={{ color: 'var(--accent-cyan)' }} />
                <span>{att.filename}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({formatFileSize(att.size)})</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
