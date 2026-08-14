import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../api/client.js';
import { useSound } from '../hooks/useSound.js';

const MailContext = createContext();

export function MailProvider({ children }) {
  const [session, setSession] = useState(() => apiClient.getStoredSession());
  const [domains, setDomains] = useState([]);
  const [messages, setMessages] = useState([]);
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const stored = localStorage.getItem('tempsumanmail_starred');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [pollCountdown, setPollCountdown] = useState(10);
  const [healthStatus, setHealthStatus] = useState(null);
  const [latencyMs, setLatencyMs] = useState(28);

  const { soundEnabled, toggleSound, playNotificationSound } = useSound();
  const knownMessageIds = useRef(new Set());
  const readMessageIds = useRef(new Set());
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const loadReadIdsForSession = useCallback((token) => {
    if (!token) {
      readMessageIds.current.clear();
      return;
    }
    try {
      const stored = localStorage.getItem(`tempsumanmail_read_${token}`);
      if (stored) {
        const arr = JSON.parse(stored);
        readMessageIds.current = new Set(arr);
      } else {
        readMessageIds.current.clear();
      }
    } catch (e) {
      readMessageIds.current.clear();
    }
  }, []);

  const saveReadId = useCallback((token, id) => {
    if (!token || !id) return;
    readMessageIds.current.add(id);
    try {
      localStorage.setItem(`tempsumanmail_read_${token}`, JSON.stringify(Array.from(readMessageIds.current)));
    } catch (e) {}
  }, []);

  const toggleStar = useCallback((messageId) => {
    setStarredIds(prev => {
      const isStarred = prev.includes(messageId);
      const next = isStarred ? prev.filter(id => id !== messageId) : [...prev, messageId];
      try {
        localStorage.setItem('tempsumanmail_starred', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchDomains = useCallback(async () => {
    try {
      const list = await apiClient.getDomains();
      setDomains(list);
    } catch (err) {
      setDomains([]);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const h = await apiClient.getHealth();
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setHealthStatus(h);
    } catch (e) {
      setHealthStatus({ healthy: false });
    }
  }, []);

  const fetchMessages = useCallback(async (isManual = false) => {
    if (!session?.token) return;
    if (isManual) setRefreshing(true);

    const start = performance.now();
    try {
      const fetched = await apiClient.getMessages(session.token);
      const end = performance.now();
      setLatencyMs(Math.round(end - start));

      let hasNew = false;

      const normalized = fetched.map(msg => {
        const isRead = Boolean(msg.seen || readMessageIds.current.has(msg.id));
        if (!knownMessageIds.current.has(msg.id)) {
          knownMessageIds.current.add(msg.id);
          hasNew = true;
        }
        return {
          ...msg,
          seen: isRead
        };
      });

      setMessages(normalized);

      if (hasNew && knownMessageIds.current.size > fetched.length - 1 && fetched.length > 0) {
        playNotificationSound();
        addToast('New email received in mailbox', 'success');
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const latest = fetched[0];
          new Notification('New Email - TempSumanMail', {
            body: `${latest.from}: ${latest.subject}`,
            icon: '/favicon.ico'
          });
        }
      }
    } catch (err) {
      if (err.message && (err.message.includes('expired') || err.message.includes('401') || err.message.includes('404') || err.message.includes('Session') || err.message.includes('Failed to fetch messages'))) {
        setSession(null);
        setMessages([]);
        setSelectedMessage(null);
        apiClient.clearSession();
        createRandomInbox();
      }
    } finally {
      if (isManual) setRefreshing(false);
      setPollCountdown(10);
    }
  }, [session, playNotificationSound, addToast]);

  const createRandomInbox = useCallback(async (preferredDomain = null, preferredProvider = null) => {
    setLoading(true);
    setError(null);
    setSelectedMessage(null);
    setMessages([]);
    knownMessageIds.current.clear();
    readMessageIds.current.clear();

    try {
      const newSession = await apiClient.createInbox(preferredDomain, preferredProvider);
      setSession(newSession);
      loadReadIdsForSession(newSession.token);
      addToast('Generated new disposable inbox', 'success');
      return newSession;
    } catch (err) {
      setError(err.message);
      addToast(`Error: ${err.message}`, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, loadReadIdsForSession]);

  const createCustomInbox = useCallback(async (localPart, domain, preferredProvider = null) => {
    setLoading(true);
    setError(null);
    setSelectedMessage(null);
    setMessages([]);
    knownMessageIds.current.clear();
    readMessageIds.current.clear();

    try {
      const newSession = await apiClient.createCustomInbox(localPart, domain, preferredProvider);
      setSession(newSession);
      loadReadIdsForSession(newSession.token);
      addToast(`Inbox address set to ${newSession.address}`, 'success');
      return newSession;
    } catch (err) {
      setError(err.message);
      addToast(`Error: ${err.message}`, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, loadReadIdsForSession]);

  const deleteMessage = useCallback(async (messageId) => {
    if (!session?.token || !messageId) return;
    try {
      await apiClient.deleteMessage(session.token, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      addToast('Message deleted', 'info');
    } catch (err) {
      addToast('Failed to delete message', 'error');
    }
  }, [session, selectedMessage, addToast]);

  const deleteCurrentInbox = useCallback(async () => {
    if (!session?.token) return;
    try {
      await apiClient.deleteInbox(session.token);
      setSession(null);
      setMessages([]);
      setSelectedMessage(null);
      knownMessageIds.current.clear();
      readMessageIds.current.clear();
      addToast('Mailbox session terminated', 'info');
      await createRandomInbox();
    } catch (err) {
      addToast('Failed to delete inbox', 'error');
    }
  }, [session, addToast, createRandomInbox]);

  const openMessage = useCallback(async (messageSummary) => {
    if (!session?.token || !messageSummary?.id) return;

    saveReadId(session.token, messageSummary.id);
    setMessages(prev => prev.map(m => m.id === messageSummary.id ? { ...m, seen: true } : m));

    setLoadingDetails(true);
    try {
      const details = await apiClient.getMessage(session.token, messageSummary.id);
      setSelectedMessage({ ...details, seen: true });
    } catch (err) {
      addToast('Failed to load message content', 'error');
    } finally {
      setLoadingDetails(false);
    }
  }, [session, addToast, saveReadId]);

  const closeMessage = useCallback(() => {
    setSelectedMessage(null);
  }, []);

  useEffect(() => {
    const unreadCount = messages.filter(m => !m.seen).length;
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) TempSumanMail — Incoming Mail`;
    } else {
      document.title = 'TempSumanMail — Instant Disposable Temporary Email';
    }
  }, [messages]);

  useEffect(() => {
    fetchDomains();
    checkHealth();
    if (!session) {
      createRandomInbox();
    } else {
      loadReadIdsForSession(session.token);
    }
  }, []);

  useEffect(() => {
    if (!session?.token) return;

    fetchMessages(false);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setPollCountdown(prev => {
        if (prev <= 1) return 10;
        return prev - 1;
      });
    }, 1000);

    pollIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(false);
      }
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMessages(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.token, fetchMessages]);

  return (
    <MailContext.Provider
      value={{
        session,
        domains,
        messages,
        starredIds,
        selectedMessage,
        loading,
        refreshing,
        loadingDetails,
        error,
        toasts,
        pollCountdown,
        soundEnabled,
        healthStatus,
        latencyMs,
        toggleSound,
        toggleStar,
        addToast,
        removeToast,
        createRandomInbox,
        createCustomInbox,
        fetchMessages,
        deleteMessage,
        deleteCurrentInbox,
        openMessage,
        closeMessage,
        checkHealth
      }}
    >
      {children}
    </MailContext.Provider>
  );
}

export function useMail() {
  const context = useContext(MailContext);
  if (!context) {
    throw new Error('useMail must be used within a MailProvider');
  }
  return context;
}
