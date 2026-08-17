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
    if (domain && !this.domains.includes(domain)) {
      throw new Error(`Domain ${domain} is not supported by ${this.name}`);
    }

    const initRes = await fetch(`${this.baseUrl}?f=get_email_address`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!initRes.ok) {
      throw new Error(`Guerrilla Mail initialization failed: ${initRes.status}`);
    }

    const initData = await initRes.json();
    const sidToken = initData.sid_token;
    const selectedDomain = domain || this.domains[0];
    let username = initData.mail_user || initData.email_addr?.split('@')[0] || `user_${Math.random().toString(36).substring(2, 10)}`;

    if (localPart) {
      const cleanUser = localPart.toLowerCase().replace(/[^a-z0-9_.+-]/g, '');
      const setUserRes = await fetch(`${this.baseUrl}?f=set_email_user&email_user=${encodeURIComponent(cleanUser)}&sid_token=${encodeURIComponent(sidToken)}`);
      if (setUserRes.ok) {
        const setUserData = await setUserRes.json();
        username = setUserData.mail_user || cleanUser;
      } else {
        username = cleanUser;
      }
    }

    const finalAddress = `${username}@${selectedDomain}`;

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

    return list.map(item => {
      const isWelcome = String(item.mail_id) === '1' || item.mail_from?.includes('no-reply@guerrillamail.com');
      const baseTime = item.mail_timestamp ? parseInt(item.mail_timestamp, 10) * 1000 : Date.now();
      const receivedAt = isWelcome ? new Date(baseTime - 86400000).toISOString() : new Date(baseTime).toISOString();

      return {
        id: String(item.mail_id),
        from: item.mail_from || 'Unknown',
        fromAddress: (item.mail_from || '').match(/<([^>]+)>/)?.[1] || item.mail_from || '',
        fromName: (item.mail_from || '').replace(/<[^>]+>/, '').trim() || item.mail_from || '',
        subject: item.mail_subject || '(No Subject)',
        snippet: item.mail_excerpt || '',
        receivedAt,
        seen: Boolean(item.mail_read === '1' || item.mail_read === 1),
        hasAttachments: Boolean(item.atts && item.atts.length > 0),
        size: item.mail_size ? parseInt(item.mail_size, 10) : 0
      };
    }).sort((a, b) => {
      const isAWelcome = a.id === '1' || a.fromAddress === 'no-reply@guerrillamail.com';
      const isBWelcome = b.id === '1' || b.fromAddress === 'no-reply@guerrillamail.com';
      if (isAWelcome && !isBWelcome) return 1;
      if (!isAWelcome && isBWelcome) return -1;

      const diff = new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      if (diff !== 0) return diff;

      const numA = Number(a.id);
      const numB = Number(b.id);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numB - numA;
      }
      return 0;
    });
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
