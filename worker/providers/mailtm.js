import { BaseProvider } from './base.js';

export class MailTmProvider extends BaseProvider {
  constructor(baseUrl = 'https://api.mail.tm', name = 'mailtm') {
    super(name);
    this.baseUrl = baseUrl;
  }

  async listDomains() {
    try {
      const res = await fetch(`${this.baseUrl}/domains`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const domains = (data['hydra:member'] || data || [])
          .filter(d => d.isActive !== false)
          .map(d => d.domain);
        if (domains && domains.length > 0) {
          return domains;
        }
      }
    } catch (e) {}
    return ['emalupe.com'];
  }

  async createInbox(localPart, domain) {
    const domains = await this.listDomains();
    if (!domains || domains.length === 0) {
      throw new Error(`No available domains on ${this.name}`);
    }
    if (domain && !domains.includes(domain)) {
      throw new Error(`Domain ${domain} is not supported by ${this.name}`);
    }
    const selectedDomain = domain || domains[0];
    const username = localPart ? localPart.toLowerCase().replace(/[^a-z0-9_.+-]/g, '') : `user_${Math.random().toString(36).substring(2, 10)}`;
    const address = `${username}@${selectedDomain}`;
    const password = `pwd_${Math.random().toString(36).substring(2, 14)}!A1`;

    const accountRes = await fetch(`${this.baseUrl}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ address, password })
    });

    if (!accountRes.ok) {
      if (accountRes.status === 422) {
        throw new Error(`Username "${username}" is already taken on @${selectedDomain}. Please choose another username.`);
      }
      const err = await accountRes.text();
      throw new Error(`Account creation failed on ${this.name}: ${accountRes.status} ${err}`);
    }

    const accountData = await accountRes.json();

    const tokenRes = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ address, password })
    });

    if (!tokenRes.ok) {
      throw new Error(`Failed to obtain token on ${this.name}`);
    }

    const tokenData = await tokenRes.json();

    return {
      address,
      credentials: {
        provider: this.name,
        token: tokenData.token,
        accountId: accountData.id || tokenData.id,
        address,
        password
      }
    };
  }

  async listMessages(credentials) {
    const res = await fetch(`${this.baseUrl}/messages`, {
      headers: {
        'Authorization': `Bearer ${credentials.token}`,
        'Accept': 'application/json'
      }
    });

    if (res.status === 401 || res.status === 403 || res.status === 404) {
      const err = new Error('Session expired or unauthorized');
      err.status = 401;
      throw err;
    }

    if (!res.ok) {
      throw new Error(`Failed to list messages on ${this.name}: ${res.status}`);
    }

    const data = await res.json();
    const items = data['hydra:member'] || data || [];

    return items.map(msg => ({
      id: msg.id,
      from: msg.from ? (typeof msg.from === 'object' ? `${msg.from.name || ''} <${msg.from.address || ''}>`.trim() : msg.from) : 'Unknown',
      fromAddress: msg.from?.address || '',
      fromName: msg.from?.name || '',
      subject: msg.subject || '(No Subject)',
      snippet: msg.intro || '',
      receivedAt: msg.createdAt || new Date().toISOString(),
      seen: Boolean(msg.seen),
      hasAttachments: Boolean(msg.hasAttachments || (msg.attachments && msg.attachments.length > 0)),
      size: msg.size || 0
    }));
  }

  async getMessage(credentials, id) {
    const res = await fetch(`${this.baseUrl}/messages/${id}`, {
      headers: {
        'Authorization': `Bearer ${credentials.token}`,
        'Accept': 'application/json'
      }
    });

    if (res.status === 401 || res.status === 403 || res.status === 404) {
      const err = new Error('Session expired or message not found');
      err.status = 401;
      throw err;
    }

    if (!res.ok) {
      throw new Error(`Failed to get message ${id} on ${this.name}: ${res.status}`);
    }

    const data = await res.json();

    fetch(`${this.baseUrl}/messages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${credentials.token}`,
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ seen: true })
    }).catch(() => {});

    return {
      id: data.id,
      from: data.from ? (typeof data.from === 'object' ? `${data.from.name || ''} <${data.from.address || ''}>`.trim() : data.from) : 'Unknown',
      fromAddress: data.from?.address || '',
      fromName: data.from?.name || '',
      to: (data.to || []).map(t => typeof t === 'object' ? t.address : t).join(', '),
      subject: data.subject || '(No Subject)',
      receivedAt: data.createdAt || new Date().toISOString(),
      seen: true,
      html: Array.isArray(data.html) ? data.html.join('') : (data.html || ''),
      text: data.text || '',
      attachments: (data.attachments || []).map(att => ({
        id: att.id,
        filename: att.filename || 'attachment',
        contentType: att.contentType || 'application/octet-stream',
        size: att.size || 0,
        downloadUrl: att.downloadUrl ? `${this.baseUrl}${att.downloadUrl}` : null
      }))
    };
  }

  async deleteMessage(credentials, id) {
    const res = await fetch(`${this.baseUrl}/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${credentials.token}`
      }
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete message on ${this.name}: ${res.status}`);
    }
    return true;
  }

  async deleteInbox(credentials) {
    if (!credentials.accountId) return true;
    const res = await fetch(`${this.baseUrl}/accounts/${credentials.accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${credentials.token}`
      }
    });
    return res.ok || res.status === 404;
  }
}
