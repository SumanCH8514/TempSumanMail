import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';

export function CustomAddressModal({ isOpen, onClose }) {
  const { domains, createCustomInbox, loading } = useMail();
  const [localPart, setLocalPart] = useState('sumanmail');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (!localPart) {
        setLocalPart('sumanmail');
      }
      setValidationError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (domains && domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0]);
    }
  }, [domains, selectedDomain]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const clean = (localPart || 'sumanmail').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (clean.length < 2) {
      setValidationError('Username must be at least 2 characters.');
      return;
    }
    if (!selectedDomain) {
      setValidationError('Please select a domain.');
      return;
    }

    try {
      await createCustomInbox(clean, selectedDomain);
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to create custom inbox');
    }
  };

  return createPortal(
    <div className="modal-backdrop anim-fade-in" onClick={onClose}>
      <div className="modal-card anim-scale-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="modal-title">Customize Address</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="custom-username">Local-part (Username)</label>
            <input
              id="custom-username"
              type="text"
              className="form-input"
              placeholder="e.g. sumanmail"
              value={localPart}
              onChange={e => {
                setLocalPart(e.target.value);
                setValidationError('');
              }}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="custom-domain">Select Domain</label>
            <select
              id="custom-domain"
              className="form-select"
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
            >
              {domains.map(dom => (
                <option key={dom} value={dom}>
                  @{dom}
                </option>
              ))}
            </select>
          </div>

          {validationError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} />
              <span>{loading ? 'Creating...' : 'Set Address'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
