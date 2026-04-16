const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 10000;

const ALLOWED_ORIGINS = [
  's.to',
  'aniworld.to',
  'serienstream.to',
  'serien.domains',
  'anicloud.domains',
];

function isAllowedOrigin(targetUrl) {
  try {
    const parsed = new url.URL(targetUrl);
    return ALLOWED_ORIGINS.some(o => parsed.hostname.endsWith(o));
  } catch {
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
};

const server = http.createServer((req, res) => {
  const parsedReq = url.parse(req.url, true);

  // ── CORS-Proxy endpoint: /proxy?url=https://... ─────────────────────────
  if (parsedReq.pathname === '/proxy') {
    const targetUrl = parsedReq.query.url;

    if (!targetUrl) {
      res.writeHead(400);
      return res.end('Missing ?url= parameter');
    }

    if (!isAllowedOrigin(targetUrl)) {
      res.writeHead(403);
      return res.end('Target not allowed');
    }

    const parsedTarget = url.parse(targetUrl);
    const lib = parsedTarget.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedTarget.hostname,
      port: parsedTarget.port || (parsedTarget.protocol === 'https:' ? 443 : 80),
      path: parsedTarget.path,
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        'Referer': `${parsedTarget.protocol}//${parsedTarget.hostname}/`,
        ...(req.headers['content-type'] ? { 'Content-Type': req.headers['content-type'] } : {}),
      },
    };

    const proxyReq = lib.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': proxyRes.headers['content-type'] || 'text/html',
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
      console.error('Proxy error:', e.message);
      if (!res.headersSent) {
        res.writeHead(502);
        res.end('Proxy error: ' + e.message);
      }
    });

    if (req.method === 'POST') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }

    return;
  }

  // ── OPTIONS preflight ────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // ── Static file server ───────────────────────────────────────────────────
  let filePath = parsedReq.pathname === '/'
    ? path.join(__dirname, 'public', 'index.html')
    : path.join(__dirname, 'public', parsedReq.pathname);

  // Security: prevent path traversal
  const publicDir = path.resolve(__dirname, 'public');
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`SerienStream running on port ${PORT}`);
  console.log(`Proxy endpoint: /proxy?url=<encoded-url>`);
});
