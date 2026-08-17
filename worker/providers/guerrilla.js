import { BaseProvider } from './base.js';

export class GuerrillaProvider extends BaseProvider {
  constructor(baseUrl = 'https://api.guerrillamail.com/ajax.php') {
    super('guerrilla');
    this.baseUrl = baseUrl;
    this.domains = [
      'guerrillamail.com',
      'guerrillamail.net',
      'guerrillamail.org',
      'guerrillamailblock.com',
      'sharklasers.com',
      'grr.la',
      'pokemail.net',
      'spam4.me'
    ];
  }

  async listDomains() {
    return this.domains;
  }

  async createInbox(localPart, domain) {
    const initRes = await fetch(`${this.baseUrl}?f=get_email_address`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!initRes.ok) {
      throw new Error(`Guerrilla Mail initialization failed: ${initRes.status}`);
    }

    const initData = await initRes.json();
    const sidToken = initData.sid_token;
    let finalAddress = initData.email_addr;

    if (localPart) {
      const cleanUser = localPart.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      const setUserRes = await fetch(`${this.baseUrl}?f=set_email_user&email_user=${encodeURIComponent(cleanUser)}&sid_token=${encodeURIComponent(sidToken)}`);
      if (setUserRes.ok) {
        const setUserData = await setUserRes.json();
        finalAddress = setUserData.email_addr || finalAddress;
      }
    }

    return {
      address: finalAddress,
      credentials: {
        provider: this.name,
        sidToken,
        address: finalAddress
      }
    };
  }

  async listMessages(credentials) {
    const res = await fetch(`${this.baseUrl}?f=get_email_list&offset=0&sid_token=${encodeURIComponent(credentials.sidToken)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Guerrilla Mail listMessages failed: ${res.status}`);
    }

    const data = await res.json();
    const list = data.list || [];

    return list.map(item => ({
      id: String(item.mail_id),
      from: item.mail_from || 'Unknown',
      fromAddress: (item.mail_from || '').match(/<([^>]+)>/)?.[1] || item.mail_from || '',
      fromName: (item.mail_from || '').replace(/<[^>]+>/, '').trim() || item.mail_from || '',
      subject: item.mail_subject || '(No Subject)',
      snippet: item.mail_excerpt || '',
      receivedAt: item.mail_timestamp ? new Date(parseInt(item.mail_timestamp, 10) * 1000).toISOString() : new Date().toISOString(),
      seen: Boolean(item.mail_read === '1' || item.mail_read === 1),
      hasAttachments: Boolean(item.atts && item.atts.length > 0),
      size: item.mail_size ? parseInt(item.mail_size, 10) : 0
    })).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  async getMessage(credentials, id) {
    const res = await fetch(`${this.baseUrl}?f=fetch_email&email_id=${encodeURIComponent(id)}&sid_token=${encodeURIComponent(credentials.sidToken)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Guerrilla Mail getMessage failed: ${res.status}`);
    }

    const data = await res.json();
    const isHtml = /<[a-z][\s\S]*>/i.test(data.mail_body || '');

    return {
      id: String(data.mail_id || id),
      from: data.mail_from || 'Unknown',
      fromAddress: (data.mail_from || '').match(/<([^>]+)>/)?.[1] || data.mail_from || '',
      fromName: (data.mail_from || '').replace(/<[^>]+>/, '').trim() || data.mail_from || '',
      to: credentials.address || data.mail_recipient || '',
      subject: data.mail_subject || '(No Subject)',
      receivedAt: data.mail_timestamp ? new Date(parseInt(data.mail_timestamp, 10) * 1000).toISOString() : new Date().toISOString(),
      seen: true,
      html: isHtml ? (data.mail_body || '') : '',
      text: !isHtml ? (data.mail_body || '') : (data.mail_excerpt || ''),
      attachments: (data.atts || []).map((att, idx) => ({
        id: String(idx),
        filename: att.name || 'attachment',
        contentType: att.type || 'application/octet-stream',
        size: att.size || 0,
        downloadUrl: null
      }))
    };
  }

  async deleteMessage(credentials, id) {
    const res = await fetch(`${this.baseUrl}?f=del_email&email_ids[]=${encodeURIComponent(id)}&sid_token=${encodeURIComponent(credentials.sidToken)}`);
    return res.ok;
  }

  async deleteInbox(credentials) {
    const res = await fetch(`${this.baseUrl}?f=forget_me&email_addr=${encodeURIComponent(credentials.address)}&sid_token=${encodeURIComponent(credentials.sidToken)}`);
    return res.ok;
  }
}
