import { createServer } from 'node:http';

import { handleAiRoute, resolveAiRoute } from './handler';
import { AI_ROUTES } from './routes';

const PORT = Number(process.env.PORT ?? process.env.AI_PROXY_PORT ?? 8787);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const pathname = req.url?.split('?')[0] ?? '';

  if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...CORS_HEADERS });
    res.end(JSON.stringify({ ok: true, service: 'betterme-ai-proxy' }));
    return;
  }

  const route = resolveAiRoute(pathname);

  if (req.method !== 'POST' || !route) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...CORS_HEADERS });
    res.end(
      JSON.stringify({
        ok: false,
        error: 'Not found',
        availableRoutes: Object.values(AI_ROUTES),
      }),
    );
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  const result = await handleAiRoute(route, rawBody);
  res.writeHead(result.status, {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
  });
  res.end(JSON.stringify(result.body));
});

server.listen(PORT, () => {
  console.info(`AI proxy listening on http://localhost:${PORT}`);
  for (const route of Object.values(AI_ROUTES)) {
    console.info(`  POST http://localhost:${PORT}${route}`);
  }
});
