import React, { useState } from 'react';
import { Mail, Sun, Moon, Volume2, VolumeX, Bell, Keyboard, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useMail } from '../context/MailContext.jsx';
import { ShortcutsModal } from './ShortcutsModal.jsx';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound, session, latencyMs, addToast } = useMail();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notifGranted, setNotifGranted] = useState(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  });

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      addToast('Notifications not supported in this browser', 'error');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotifGranted(true);
        addToast('Desktop alerts activated', 'success');
      } else {
        addToast('Notification permission denied', 'info');
      }
    } catch (e) {}
  };

  const currentProvider = session?.provider || 'mailtm';

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Mail size={20} strokeWidth={2.4} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="brand-title">TempSumanMail</h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Pro Disposable Mail
            </span>
          </div>
        </div>

        <div className="header-actions">
          <div className="provider-badge" title={`Connected via ${currentProvider} edge cluster`}>
            <span className="status-dot"></span>
            <span style={{ textTransform: 'capitalize' }}>{currentProvider}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>&bull; {latencyMs}ms</span>
          </div>

          <button
            className="icon-btn"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard size={17} />
          </button>

          <button
            className={`icon-btn ${soundEnabled ? 'active' : ''}`}
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          <button
            className={`icon-btn ${notifGranted ? 'active' : ''}`}
            onClick={requestNotificationPermission}
            title={notifGranted ? 'Desktop notifications active' : 'Enable desktop notifications'}
            aria-label="Enable Notifications"
          >
            <Bell size={17} />
          </button>

          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </header>
  );
}
