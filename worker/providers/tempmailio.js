import { BaseProvider } from './base.js';

export class TempMailIoProvider extends BaseProvider {
  constructor(baseUrl = 'https://api.internal.temp-mail.io/api/v3') {
    super('tempmailio');
    this.baseUrl = baseUrl;
    this.fallbackDomains = [
      'bltiwd.com',
      'bwmyga.com',
      'ozsaip.com',
      'yzcalo.com',
      'lnovic.com',
      'ruutukf.com',
      'gmeenramy.com',
      'olipii.com'
    ];
  }

  async listDomains() {
    try {
      const res = await fetch(`${this.baseUrl}/domains`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const domains = (data.domains || []).map(d => d.name).filter(Boolean);
        if (domains.length > 0) {
          return domains;
        }
      }
    } catch (e) {}
    return this.fallbackDomains;
  }

  async createInbox(localPart, domain) {
    const domains = await this.listDomains();
    const selectedDomain = domain && domains.includes(domain) ? domain : domains[0];
    const username = localPart
      ? localPart.toLowerCase().replace(/[^a-z0-9_.+-]/g, '')
      : `user_${Math.random().toString(36).substring(2, 10)}`;

    const res = await fetch(`${this.baseUrl}/email/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name: username, domain: selectedDomain })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Temp-Mail.io inbox creation failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const address = data.email || `${username}@${selectedDomain}`;

    return {
      address,
      credentials: {
        provider: this.name,
        address,
        token: data.token,
        username,
        domain: selectedDomain
      }
    };
  }

  async listMessages(credentials) {
    const res = await fetch(`${this.baseUrl}/email/${encodeURIComponent(credentials.address)}/messages`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to list messages on ${this.name}: ${res.status}`);
    }

    const items = await res.json();

    return (Array.isArray(items) ? items : []).map(msg => ({
      id: msg.id,
      from: msg.from || 'Unknown',
      fromAddress: msg.from || '',
      fromName: msg.from?.split('@')[0] || msg.from || '',
      subject: msg.subject || '(No Subject)',
      snippet: msg.body_text ? msg.body_text.slice(0, 100) : '',
      receivedAt: msg.created_at || new Date().toISOString(),
      seen: false,
      hasAttachments: Boolean(msg.attachments && msg.attachments.length > 0),
      size: 0
    }));
  }

  async getMessage(credentials, id) {
    const res = await fetch(`${this.baseUrl}/message/${encodeURIComponent(id)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to get message ${id} on ${this.name}: ${res.status}`);
    }

    const data = await res.json();

    return {
      id: data.id || id,
      from: data.from || 'Unknown',
      fromAddress: data.from || '',
      fromName: data.from?.split('@')[0] || data.from || '',
      to: data.to || credentials.address,
      subject: data.subject || '(No Subject)',
      receivedAt: data.created_at || new Date().toISOString(),
      seen: true,
      html: data.body_html || data.body_text || '',
      text: data.body_text || '',
      attachments: (data.attachments || []).map(att => ({
        id: att.id || att.name,
        filename: att.name || 'attachment',
        contentType: att.content_type || 'application/octet-stream',
        size: att.size || 0,
        downloadUrl: att.download_url ? att.download_url : null
      }))
    };
  }

  async deleteMessage(credentials, id) {
    return true;
  }

  async deleteInbox(credentials) {
    return true;
  }
}
