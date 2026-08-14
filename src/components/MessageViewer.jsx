import React, { useState } from 'react';
import { ArrowLeft, Trash2, Download, Paperclip, ShieldCheck, Code, FileText, Globe, Printer, Copy, Check } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatRelativeTime, formatFileSize, getInitials } from '../utils/formatters.js';
import { sanitizeHtml, buildIframeSrcDoc } from '../utils/sanitizer.js';

export function MessageViewer({ message, onBack }) {
  const { deleteMessage, addToast } = useMail();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('html');
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!message) return null;

  const initials = getInitials(message.fromName, message.fromAddress);
  const timeFormatted = formatRelativeTime(message.receivedAt);
  const sanitized = sanitizeHtml(message.html);
  const iframeDoc = buildIframeSrcDoc(sanitized || `<pre style="white-space: pre-wrap; font-family: sans-serif;">${message.text || 'No message content'}</pre>`, theme);

  const handleDelete = () => {
    deleteMessage(message.id);
    onBack();
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

  return (
    <div className="reader-container anim-fade-in">
      <div className="reader-top-bar">
        <button
          className="action-btn"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          title="Back to inbox (Esc)"
        >
          <ArrowLeft size={15} />
          <span>Back to Messages</span>
          <kbd className="action-kbd">Esc</kbd>
        </button>

        <div className="reader-actions-group">
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
            className="action-btn danger"
            onClick={handleDelete}
            title="Delete this message"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="reader-meta-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <h2 className="reader-subject">{message.subject || '(No Subject)'}</h2>
          <div className="security-pill" title="Rendered safely in a sandboxed container">
            <ShieldCheck size={14} />
            <span>Sanitized &amp; Isolated</span>
          </div>
        </div>

        <div className="reader-sender-info">
          <div className="reader-avatar-row">
            <div className="sender-avatar">
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {message.fromName || message.from}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {message.fromAddress ? `<${message.fromAddress}>` : ''} &bull; To: {message.to || 'Your Inbox'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {new Date(message.receivedAt).toLocaleString()} ({timeFormatted})
          </div>
        </div>
      </div>

      <div className="reader-tabs">
        <button
          className={`tab-btn ${activeTab === 'html' ? 'active' : ''}`}
          onClick={() => setActiveTab('html')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} /> Formatted HTML
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileText size={14} /> Plain Text
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Code size={14} /> Raw Payload
          </span>
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
