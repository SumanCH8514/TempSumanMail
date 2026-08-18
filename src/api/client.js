const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';
const STORAGE_KEY = 'tempsumanmail_session';

export const apiClient = {
  getStoredSession() {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (!item) return null;
      const session = JSON.parse(item);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  },

  saveSession(session) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {}
  },

  clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  },

  async getDomains() {
    const res = await fetch(`${API_BASE}/domains`);
    if (!res.ok) throw new Error('Failed to fetch domains');
    const data = await res.json();
    return data.domains || [];
  },

  async createInbox(preferredDomain, preferredProvider) {
    const res = await fetch(`${API_BASE}/inbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredDomain, preferredProvider })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create inbox');
    }
    const session = {
      address: data.address,
      token: data.token,
      provider: data.provider,
      expiresAt: data.expiresAt
    };
    this.saveSession(session);
    return session;
  },

  async createCustomInbox(localPart, domain, preferredProvider) {
    const res = await fetch(`${API_BASE}/inbox/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localPart, domain, preferredProvider })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create custom inbox');
    }
    const session = {
      address: data.address,
      token: data.token,
      provider: data.provider,
      expiresAt: data.expiresAt
    };
    this.saveSession(session);
    return session;
  },

  messageEtags: new Map(),
  messageCache: new Map(),

  async getMessages(token) {
    const headers = {};
    const cachedEtag = this.messageEtags.get(token);
    if (cachedEtag) {
      headers['If-None-Match'] = cachedEtag;
    }

    const res = await fetch(`${API_BASE}/inbox/${token}/messages`, { headers });

    if (res.status === 304) {
      return this.messageCache.get(token) || [];
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      if (res.status === 401 || res.status === 404 || data.expired) {
        this.clearSession();
      }
      throw new Error(data.error || 'Failed to fetch messages');
    }

    const etag = res.headers.get('ETag');
    if (etag) {
      this.messageEtags.set(token, etag);
    }
    const msgs = data.messages || [];
    this.messageCache.set(token, msgs);
    return msgs;
  },

  async getMessage(token, id) {
    const res = await fetch(`${API_BASE}/inbox/${token}/messages/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch message details');
    }
    return data.message;
  },

  async deleteMessage(token, id) {
    const res = await fetch(`${API_BASE}/inbox/${token}/messages/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete message');
    }
    return true;
  },

  async deleteInbox(token) {
    try {
      await fetch(`${API_BASE}/inbox/${token}`, {
        method: 'DELETE'
      });
    } finally {
      this.clearSession();
    }
    return true;
  },

  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) return { healthy: false };
      return await res.json();
    } catch (e) {
      return { healthy: false };
    }
  }
};
