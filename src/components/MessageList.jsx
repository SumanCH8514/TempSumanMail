import React, { useState, useRef, useEffect } from 'react';
import { Search, Inbox as InboxIcon, RefreshCw, Star, MailOpen, Filter } from 'lucide-react';
import { useMail } from '../context/MailContext.jsx';
import { MessageItem } from './MessageItem.jsx';
import { MessageViewer } from './MessageViewer.jsx';
import { EmptyState } from './EmptyState.jsx';

export function MessageList() {
  const {
    messages,
    starredIds,
    selectedMessage,
    openMessage,
    closeMessage,
    loadingDetails,
    refreshing,
    fetchMessages,
    session
  } = useMail();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = messages.filter(m => !m.seen).length;
  const starredCount = messages.filter(m => starredIds.includes(m.id)).length;

  const filtered = messages.filter(msg => {
    if (activeFilter === 'unread' && msg.seen) return false;
    if (activeFilter === 'starred' && !starredIds.includes(msg.id)) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (msg.subject && msg.subject.toLowerCase().includes(term)) ||
      (msg.from && msg.from.toLowerCase().includes(term)) ||
      (msg.fromAddress && msg.fromAddress.toLowerCase().includes(term)) ||
      (msg.snippet && msg.snippet.toLowerCase().includes(term))
    );
  });

  if (selectedMessage) {
    return (
      <div className="inbox-view-container">
        <MessageViewer message={selectedMessage} onBack={closeMessage} />
      </div>
    );
  }

  return (
    <div className="inbox-view-container anim-slide-up">
      <div className="inbox-header-bar">
        <div className="inbox-filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <InboxIcon size={15} />
            <span>All</span>
            <span className="tab-badge">{messages.length}</span>
          </button>

          <button
            className={`filter-tab ${activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            <MailOpen size={15} />
            <span>Unread</span>
            {unreadCount > 0 && <span className="tab-badge unread">{unreadCount}</span>}
          </button>

          <button
            className={`filter-tab ${activeFilter === 'starred' ? 'active' : ''}`}
            onClick={() => setActiveFilter('starred')}
          >
            <Star size={15} />
            <span>Starred</span>
            {starredCount > 0 && <span className="tab-badge">{starredCount}</span>}
          </button>
        </div>

        <div className="inbox-search-actions">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search subject, sender..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <kbd className="search-kbd">/</kbd>
          </div>

          <button
            className="icon-btn"
            onClick={() => fetchMessages(true)}
            disabled={refreshing || !session?.token}
            title="Refresh inbox"
            aria-label="Refresh inbox"
          >
            <RefreshCw size={15} className={refreshing ? 'anim-spin-slow' : ''} />
          </button>
        </div>
      </div>

      {loadingDetails && (
        <div className="loading-state-box">
          <RefreshCw size={24} className="anim-spin-slow" style={{ color: 'var(--accent-cyan)' }} />
          <span>Decrypting &amp; rendering email content...</span>
        </div>
      )}

      {!loadingDetails && filtered.length === 0 && (
        searchTerm ? (
          <div className="filter-empty-state">
            <span>No messages matching "<strong>{searchTerm}</strong>"</span>
            <button className="btn-secondary" style={{ marginTop: '0.75rem' }} onClick={() => setSearchTerm('')}>
              Clear search
            </button>
          </div>
        ) : activeFilter === 'unread' ? (
          <div className="filter-empty-state">
            <span>No unread messages. You're all caught up!</span>
          </div>
        ) : activeFilter === 'starred' ? (
          <div className="filter-empty-state">
            <span>No starred messages. Click the star icon on any email to bookmark it.</span>
          </div>
        ) : (
          <EmptyState />
        )
      )}

      {!loadingDetails && filtered.length > 0 && (
        <div className="messages-list">
          {filtered.map(msg => (
            <MessageItem
              key={msg.id}
              message={msg}
              onSelect={openMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
