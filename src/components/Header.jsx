import React, { useState } from 'react';
import { Mail, Sun, Moon, Volume2, VolumeX, Bell, BellOff, Keyboard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useMail } from '../context/MailContext.jsx';
import { ShortcutsModal } from './ShortcutsModal.jsx';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound, notificationsEnabled, toggleNotifications, session, latencyMs } = useMail();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const currentProvider = session?.provider || 'mailtm';

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Mail size={18} strokeWidth={2.5} />
          </div>
          <div className="brand-text-col">
            <div className="brand-title-row">
              <h1 className="brand-title">
                TempSumanMail
              </h1>
              <span className="brand-pro-tag">PRO</span>
            </div>
            <span className="brand-subtitle">
              Disposable Anonymous Mail
            </span>
          </div>
        </div>

        <div className="header-actions">
          <div className="provider-badge" title={`Connected via ${currentProvider} edge cluster`}>
            <span className="status-dot"></span>
            <span className="provider-name">{currentProvider}</span>
            <span className="provider-latency">&bull; {latencyMs}ms</span>
          </div>

          <button
            className="icon-btn header-btn-shortcuts"
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
            className={`icon-btn ${notificationsEnabled ? 'active' : ''}`}
            onClick={toggleNotifications}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            aria-label="Toggle Notifications"
          >
            {notificationsEnabled ? <Bell size={17} /> : <BellOff size={17} />}
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
