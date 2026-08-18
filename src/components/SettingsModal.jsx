import React from 'react';
import { createPortal } from 'react-dom';
import { X, Settings as SettingsIcon, Volume2, Bell, Check, Music } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';

export function SettingsModal({ isOpen, onClose }) {
  useLockBodyScroll(isOpen);
  const {
    soundEnabled,
    toggleSound,
    soundType,
    setSoundType,
    previewSound,
    notificationsEnabled,
    toggleNotifications
  } = useMail();

  if (!isOpen) return null;

  const soundOptions = [
    {
      id: 'you_ve_got_mail',
      title: "You've Got Mail (Default)",
      desc: 'Classic retro voice alert'
    },
    {
      id: 'default',
      title: 'Crystal Chime',
      desc: 'Harmonic ascending chime'
    },
    {
      id: 'faaaa',
      title: 'Viral Faaaa Sound',
      desc: 'Comedic viral brass slide meme'
    },
    {
      id: 'mail_received',
      title: 'Mail Received Sound',
      desc: 'Melodic triple-tone chime alert'
    }
  ];

  return createPortal(
    <div className="modal-backdrop anim-fade-in" onClick={onClose}>
      <div className="modal-card anim-scale-in" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SettingsIcon size={19} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>Preferences &amp; Alerts</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Close settings"
          >
            <X size={19} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
              <Music size={15} style={{ color: 'var(--text-secondary)' }} />
              <label className="form-label" style={{ margin: 0 }}>Notification Alert Sound</label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {soundOptions.map(opt => {
                const isSelected = soundType === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`sound-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSoundType(opt.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div className={`sound-radio ${isSelected ? 'active' : ''}`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {opt.title}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {opt.desc}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="sound-test-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        previewSound(opt.id);
                      }}
                      title={`Preview ${opt.title}`}
                      aria-label={`Preview ${opt.title}`}
                    >
                      <Volume2 size={15} />
                      <span>Test</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sound Effects</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Play audio chime on new mail</span>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
                aria-label="Toggle sound"
              >
                <div className="toggle-switch-handle"></div>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>Desktop &amp; Mobile Push</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Trigger system notifications</span>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${notificationsEnabled ? 'active' : ''}`}
                onClick={toggleNotifications}
                aria-label="Toggle push notifications"
              >
                <div className="toggle-switch-handle"></div>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
