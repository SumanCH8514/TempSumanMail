const SECRET_SALT = 'tempsumanmail_secure_session_token_key_v1';

async function getCryptoKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_SALT.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export class SessionStore {
  constructor(kvNamespace = null) {
    this.kv = kvNamespace;
    this.memory = new Map();
  }

  async generateToken(sessionData = {}, ttlSeconds = 86400) {
    const payload = {
      ...sessionData,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000
    };

    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const key = await getCryptoKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const encoded = enc.encode(JSON.stringify(payload));
        const ciphertext = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          key,
          encoded
        );

        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(ciphertext), iv.length);

        let binary = '';
        for (let i = 0; i < combined.length; i++) {
          binary += String.fromCharCode(combined[i]);
        }
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
    } catch (e) {}

    const jsonStr = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(jsonStr))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async setSession(token, sessionData, ttlSeconds = 86400) {
    const payload = {
      ...sessionData,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000
    };
    this.memory.set(token, payload);
    return payload;
  }

  async getSession(token) {
    if (!token) return null;

    if (this.memory.has(token)) {
      const data = this.memory.get(token);
      if (data.expiresAt && Date.now() > data.expiresAt) {
        this.memory.delete(token);
        return null;
      }
      return data;
    }

    try {
      let raw = decodeURIComponent(token).replace(/-/g, '+').replace(/_/g, '/');
      while (raw.length % 4) raw += '=';

      const binary = atob(raw);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      if (bytes.length > 28 && typeof crypto !== 'undefined' && crypto.subtle) {
        try {
          const key = await getCryptoKey();
          const iv = bytes.slice(0, 12);
          const data = bytes.slice(12);
          const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
          );
          const dec = new TextDecoder();
          const parsed = JSON.parse(dec.decode(decrypted));
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
          this.memory.set(token, parsed);
          return parsed;
        } catch (err) {}
      }

      const decodedStr = decodeURIComponent(escape(binary));
      const parsed = JSON.parse(decodedStr);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
      this.memory.set(token, parsed);
      return parsed;
    } catch (e) {
      return null;
    }
  }

  async deleteSession(token) {
    this.memory.delete(token);
    return true;
  }
}
