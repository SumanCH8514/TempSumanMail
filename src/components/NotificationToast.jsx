import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';

export function NotificationToast() {
  const { toasts, removeToast } = useMail();

  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => {
        let Icon = Info;
        let iconColor = 'var(--accent-cyan)';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconColor = 'var(--accent-emerald)';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'var(--accent-rose)';
        }

        return (
          <div key={toast.id} className="toast-item anim-slide-up">
            <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.88rem' }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
