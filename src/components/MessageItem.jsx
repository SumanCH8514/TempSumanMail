import React from 'react';
import { Trash2, Paperclip, Star } from 'lucide-react';
import { formatRelativeTime, getInitials } from '../utils/formatters.js';
import { useMail } from '../context/MailContext.jsx';

function getAvatarColor(str) {
  const colors = [
    '#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#f87171'
  ];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function MessageItem({ message, onSelect }) {
  const { deleteMessage, starredIds, toggleStar } = useMail();

  const initials = getInitials(message.fromName, message.fromAddress);
  const timeFormatted = formatRelativeTime(message.receivedAt);
  const isStarred = starredIds.includes(message.id);
  const avatarBg = getAvatarColor(message.fromAddress || message.from);

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteMessage(message.id);
  };

  const handleStar = (e) => {
    e.stopPropagation();
    toggleStar(message.id);
  };

  return (
    <div
      className={`message-item ${!message.seen ? 'unread' : ''}`}
      onClick={() => onSelect(message)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(message);
        }
      }}
    >
      <button
        className={`star-btn ${isStarred ? 'starred' : ''}`}
        onClick={handleStar}
        title={isStarred ? 'Unstar' : 'Star message'}
        aria-label="Star message"
      >
        <Star size={15} fill={isStarred ? 'var(--accent-amber)' : 'none'} color={isStarred ? 'var(--accent-amber)' : 'var(--text-muted)'} />
      </button>

      <div className="sender-avatar" style={{ borderLeft: `3px solid ${avatarBg}` }}>
        {initials}
      </div>

      <div className="message-content-col">
        <div className="message-sender-row">
          {!message.seen && <span className="unread-dot" title="Unread"></span>}
          <span className="message-sender">
            {message.fromName || message.fromAddress || 'Unknown Sender'}
          </span>
          <span className="message-sender-email">
            {message.fromAddress ? `<${message.fromAddress}>` : ''}
          </span>
        </div>
        <div className="message-subject">
          {message.subject || '(No Subject)'}
        </div>
        <div className="message-snippet">
          {message.snippet || 'No message preview'}
        </div>
      </div>

      <div className="message-meta-col">
        <span className="message-time">{timeFormatted}</span>
        {message.hasAttachments && (
          <div className="attachment-indicator" title="Has attachments">
            <Paperclip size={12} />
          </div>
        )}
      </div>

      <button
        className="item-delete-btn"
        onClick={handleDelete}
        title="Delete message"
        aria-label="Delete message"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
