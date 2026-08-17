import { ProviderManager } from './providers/manager.js';
import { SessionStore } from './sessionStore.js';

const providerManager = new ProviderManager();
let globalSessionStore = null;

function getSessionStore(env) {
  if (!globalSessionStore) {
    globalSessionStore = new SessionStore(env?.SESSIONS);
  }
  return globalSessionStore;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

function renderHtmlGateway() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TempSumanMail — Backend API Gateway</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #080c14;
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
      overflow-x: hidden;
    }
    .ambient-glow {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(79, 70, 229, 0.18) 0%, rgba(6, 182, 212, 0.12) 45%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      filter: blur(40px);
    }
    .card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 520px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.15);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.05);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.8rem;
      border-radius: 9999px;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .icon-box {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.25rem;
      border-radius: 18px;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
    }
    .icon-box svg {
      width: 32px;
      height: 32px;
      stroke: #ffffff;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.6rem;
      letter-spacing: -0.02em;
    }
    p {
      color: #94a3b8;
      font-size: 0.92rem;
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 2rem;
      text-align: left;
    }
    .spec-item {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 0.75rem 0.9rem;
    }
    .spec-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      margin-bottom: 0.2rem;
    }
    .spec-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      font-weight: 600;
      color: #38bdf8;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #06b6d4 100%);
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.5);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.65);
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.15);
      color: #cbd5e1;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.88rem;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      transition: background 0.2s, color 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(51, 65, 85, 0.8);
      color: #ffffff;
    }
    .footer-text {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #475569;
    }
    .footer-text a {
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="card">
    <div class="badge">
      <span class="badge-dot"></span>
      API Edge Gateway Active
    </div>
    <div class="icon-box">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>
      </svg>
    </div>
    <h1>TempSumanMail API</h1>
    <p>Direct browser access to this API endpoint is restricted. Automated programmatic edge requests only.</p>
    <div class="specs-grid">
      <div class="spec-item">
        <div class="spec-label">Environment</div>
        <div class="spec-val">Production Edge</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Security</div>
        <div class="spec-val">AES-GCM Encrypted</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Infrastructure</div>
        <div class="spec-val">Cloudflare Workers Pro</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Provider Network</div>
        <div class="spec-val">Multi-Cluster Live</div>
      </div>
    </div>
    <div class="btn-group">
      <a href="https://tempsumanmail.sumanonline.com" class="btn-primary">
        🚀 Launch TempSumanMail App
      </a>
      <a href="/api/v1/health" class="btn-secondary">
        ⚡ Edge Health Status
      </a>
    </div>
    <div class="footer-text">
      Designed &amp; Developed with &#10084;&#65039; by <a href="https://sumanonline.com" target="_blank" rel="noopener noreferrer">SumanOnline.Com</a>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders
    }
  });
}

export async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const store = getSessionStore(env);
  const acceptHeader = request.headers.get('Accept') || '';

  if (path === '/' || path === '') {
    if (acceptHeader.includes('text/html')) {
      return renderHtmlGateway();
    }
    return jsonResponse({
      success: true,
      service: 'TempSumanMail Edge API Engine',
      version: '1.0.0',
      status: 'operational',
      app: 'https://tempsumanmail.sumanonline.com',
      health: '/api/v1/health'
    });
  }

  try {
    if (path === '/api/v1/health' && method === 'GET') {
      const health = providerManager.getHealthStatus();
      return jsonResponse({
        success: true,
        status: 'ok',
        providers: health,
        timestamp: new Date().toISOString()
      });
    }

    if (path === '/api/v1/domains' && method === 'GET') {
      const domainsByProvider = await providerManager.getAllDomains();
      const allDomains = Array.from(new Set(Object.values(domainsByProvider).flat()));
      return jsonResponse({
        success: true,
        domains: allDomains,
        byProvider: domainsByProvider
      });
    }

    if (path === '/api/v1/inbox' && method === 'POST') {
      let body = {};
      try {
        body = await request.json();
      } catch (e) { }

      const { preferredDomain, preferredProvider } = body;
      const inbox = await providerManager.createInbox(null, preferredDomain, preferredProvider);

      const token = await store.generateToken({
        provider: inbox.provider,
        address: inbox.address,
        credentials: inbox.credentials
      });

      return jsonResponse({
        success: true,
        address: inbox.address,
        token,
        provider: inbox.provider,
        expiresAt: Date.now() + 86400000
      });
    }

    if (path === '/api/v1/inbox/custom' && method === 'POST') {
      let body = {};
      try {
        body = await request.json();
      } catch (e) {
        return errorResponse('Invalid JSON body');
      }

      const { localPart, domain, preferredProvider } = body;
      if (!localPart || !domain) {
        return errorResponse('Missing localPart or domain');
      }

      const cleanLocal = localPart.toLowerCase().replace(/[^a-z0-9_.+-]/g, '');
      if (cleanLocal.length < 2 || cleanLocal.length > 32) {
        return errorResponse('Username must be between 2 and 32 characters');
      }

      const inbox = await providerManager.createInbox(cleanLocal, domain, preferredProvider);

      const token = await store.generateToken({
        provider: inbox.provider,
        address: inbox.address,
        credentials: inbox.credentials
      });

      return jsonResponse({
        success: true,
        address: inbox.address,
        token,
        provider: inbox.provider,
        expiresAt: Date.now() + 86400000
      });
    }

    const messagesMatch = path.match(/^\/api\/v1\/inbox\/([^/]+)\/messages$/);
    if (messagesMatch && method === 'GET') {
      const token = messagesMatch[1];
      let session;
      try {
        session = await store.getSession(token);
      } catch (e) {
        return jsonResponse({ success: false, error: 'Invalid session token', expired: true }, 401);
      }

      if (!session || !session.credentials || !session.provider) {
        return jsonResponse({ success: false, error: 'Session expired or not found', expired: true }, 401);
      }

      try {
        const provider = providerManager.getProvider(session.provider);
        if (!provider) {
          return jsonResponse({ success: false, error: 'Provider unavailable', expired: true }, 401);
        }
        const messages = await provider.listMessages(session.credentials);

        return jsonResponse({
          success: true,
          address: session.address,
          provider: session.provider,
          messages
        });
      } catch (err) {
        if (err.status === 401 || err.message?.includes('expired') || err.message?.includes('401') || err.message?.includes('unauthorized')) {
          return jsonResponse({ success: false, error: 'Session expired on provider', expired: true }, 401);
        }
        return jsonResponse({
          success: true,
          address: session.address,
          provider: session.provider,
          messages: null,
          transientError: err.message
        });
      }
    }

    const singleMessageMatch = path.match(/^\/api\/v1\/inbox\/([^/]+)\/messages\/([^/]+)$/);
    if (singleMessageMatch) {
      const token = singleMessageMatch[1];
      const messageId = singleMessageMatch[2];
      let session;
      try {
        session = await store.getSession(token);
      } catch (e) {
        return jsonResponse({ success: false, error: 'Invalid session token', expired: true }, 401);
      }

      if (!session || !session.credentials || !session.provider) {
        return jsonResponse({ success: false, error: 'Session expired or not found', expired: true }, 401);
      }

      const provider = providerManager.getProvider(session.provider);
      if (!provider) {
        return jsonResponse({ success: false, error: 'Provider unavailable', expired: true }, 401);
      }

      if (method === 'GET') {
        try {
          const message = await provider.getMessage(session.credentials, messageId);
          return jsonResponse({
            success: true,
            message
          });
        } catch (err) {
          if (err.status === 401 || err.message?.includes('expired') || err.message?.includes('401')) {
            return jsonResponse({ success: false, error: 'Session expired on provider', expired: true }, 401);
          }
          return errorResponse('Failed to load message content', 400);
        }
      }

      if (method === 'DELETE') {
        try {
          await provider.deleteMessage(session.credentials, messageId);
          return jsonResponse({
            success: true,
            deletedId: messageId
          });
        } catch (err) {
          return jsonResponse({ success: true, deletedId: messageId });
        }
      }
    }

    const deleteInboxMatch = path.match(/^\/api\/v1\/inbox\/([^/]+)$/);
    if (deleteInboxMatch && method === 'DELETE') {
      const token = deleteInboxMatch[1];
      let session;
      try {
        session = await store.getSession(token);
      } catch (e) { }

      if (session && session.credentials) {
        try {
          const provider = providerManager.getProvider(session.provider);
          if (provider) {
            await provider.deleteInbox(session.credentials);
          }
        } catch (e) { }
        await store.deleteSession(token);
      }

      return jsonResponse({
        success: true,
        message: 'Inbox deleted'
      });
    }

    if (acceptHeader.includes('text/html')) {
      return renderHtmlGateway();
    }

    return errorResponse(`Endpoint not found: ${method} ${path}`, 404);
  } catch (err) {
    return errorResponse(err.message || 'Internal server error', 400);
  }
}
