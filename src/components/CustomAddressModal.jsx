import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, AlertCircle, ChevronDown, Check, Search, Globe } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';

export function CustomAddressModal({ isOpen, onClose }) {
  useLockBodyScroll(isOpen);
  const { domains, createCustomInbox, loading } = useMail();
  const [localPart, setLocalPart] = useState('sumanmail');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (!localPart) {
        setLocalPart('sumanmail');
      }
      setValidationError('');
      setIsDropdownOpen(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (domains && domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0]);
    }
  }, [domains, selectedDomain]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!isOpen) return null;

  const filteredDomains = (domains || []).filter(dom =>
    dom.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const clean = (localPart || 'sumanmail').trim().toLowerCase().replace(/[^a-z0-9_.+-]/g, '');
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
            <label className="form-label">Select Domain</label>
            <div className="custom-domain-dropdown" ref={dropdownRef}>
              <div
                className={`custom-domain-trigger ${isDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
              >
                <div className="custom-domain-trigger-left">
                  <Globe size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span className="custom-domain-trigger-text">
                    @{selectedDomain || (domains && domains[0]) || 'Loading domains...'}
                  </span>
                </div>
                <ChevronDown size={17} className={`custom-domain-chevron ${isDropdownOpen ? 'open' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="custom-domain-menu">
                  <div className="custom-domain-search-wrap">
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="custom-domain-search-input"
                      placeholder="Filter domains..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="custom-domain-list">
                    {filteredDomains.length > 0 ? (
                      filteredDomains.map(dom => {
                        const isSelected = selectedDomain === dom;
                        const tld = dom.split('.').pop();
                        return (
                          <div
                            key={dom}
                            className={`custom-domain-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedDomain(dom);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className="custom-domain-item-text">@{dom}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span className="custom-domain-badge">.{tld}</span>
                              {isSelected && <Check size={14} style={{ color: 'var(--accent-cyan)' }} />}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="custom-domain-empty">
                        No domains match "{searchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
              <ArrowRight size={16} />
              <span>{loading ? 'Creating...' : 'Set Address'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
