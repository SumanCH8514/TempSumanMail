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

export async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const store = getSessionStore(env);

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
      } catch (e) {}

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

      const cleanLocal = localPart.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
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
        throw err;
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
          throw err;
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
      } catch (e) {}

      if (session && session.credentials) {
        try {
          const provider = providerManager.getProvider(session.provider);
          if (provider) {
            await provider.deleteInbox(session.credentials);
          }
        } catch (e) {}
        await store.deleteSession(token);
      }

      return jsonResponse({
        success: true,
        message: 'Inbox deleted'
      });
    }

    return errorResponse(`Endpoint not found: ${method} ${path}`, 404);
  } catch (err) {
    return errorResponse(err.message || 'Internal server error', 500);
  }
}
