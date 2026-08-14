import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleRequest } from './worker/router.js';

function workerDevPlugin() {
  return {
    name: 'worker-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/v1')) {
          return next();
        }

        try {
          const host = req.headers.host || 'localhost:5173';
          const protocol = req.headers['x-forwarded-proto'] || 'http';
          const url = `${protocol}://${host}${req.url}`;

          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (v !== undefined) {
              if (Array.isArray(v)) {
                v.forEach(val => headers.append(k, val));
              } else {
                headers.set(k, v);
              }
            }
          }

          let body = undefined;
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            body = await new Promise((resolve, reject) => {
              const chunks = [];
              req.on('data', chunk => chunks.push(chunk));
              req.on('end', () => resolve(Buffer.concat(chunks)));
              req.on('error', reject);
            });
          }

          const request = new Request(url, {
            method: req.method,
            headers,
            body
          });

          const response = await handleRequest(request, {});

          res.statusCode = response.status;
          response.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });

          const resBody = await response.text();
          res.end(resBody);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), workerDevPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
