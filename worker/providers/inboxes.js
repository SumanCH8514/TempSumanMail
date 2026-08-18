import { BaseProvider } from './base.js';

export class InboxesProvider extends BaseProvider {
  constructor(baseUrl = 'https://inboxes.com/api/v2') {
    super('inboxes');
    this.baseUrl = baseUrl;
    this.fallbackDomains = [
      'getnada.com',
      'robot-mail.com',
      'inboxbear.com',
      'getairmail.com',
      'dropjar.com',
      'fivermail.com',
      'getmule.com',
      'gimpmail.com',
      'givmail.com',
      'guysmail.com',
      'replyloop.com',
      'tafmail.com',
      'temptami.com',
      'tupmail.com',
      'vomoto.com',
      'blondmail.com',
      'chapsmail.com',
      'clowmail.com'
    ];
  }

  async listDomains() {
    try {
      const res = await fetch(`${this.baseUrl}/domain`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const domains = (data.domains || []).map(d => d.qdn).filter(Boolean);
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
    const address = `${username}@${selectedDomain}`;

    return {
      address,
      credentials: {
        provider: this.name,
        address,
        username,
        domain: selectedDomain
      }
    };
  }

  async listMessages(credentials) {
    const res = await fetch(`${this.baseUrl}/inbox/${encodeURIComponent(credentials.address)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to list messages on ${this.name}: ${res.status}`);
    }

    const data = await res.json();
    const items = data.msgs || [];

    return items.map(msg => ({
      id: msg.uid,
      from: msg.f || msg.ff || 'Unknown',
      fromAddress: msg.ff || msg.f || '',
      fromName: msg.f || '',
      subject: msg.s || '(No Subject)',
      snippet: msg.ph || '',
      receivedAt: msg.cr || new Date().toISOString(),
      seen: Boolean(msg.d),
      hasAttachments: Boolean(msg.at && msg.at.length > 0),
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
      id: data.uid || id,
      from: data.f || data.ff || 'Unknown',
      fromAddress: data.ff || data.f || '',
      fromName: data.f || '',
      to: credentials.address,
      subject: data.s || '(No Subject)',
      receivedAt: data.cr || new Date().toISOString(),
      seen: true,
      html: data.html || data.short_html || '',
      text: data.text || '',
      attachments: (data.at || []).map(att => ({
        id: att.id || att.filename,
        filename: att.filename || 'attachment',
        contentType: att.type || 'application/octet-stream',
        size: att.size || 0,
        downloadUrl: null
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
