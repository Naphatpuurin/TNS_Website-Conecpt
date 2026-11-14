const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 8123;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2'
};

const LIVE_RELOAD_SCRIPT = `
<script>
(() => {
  const source = new EventSource('/__live_reload');
  source.onmessage = (event) => {
    if (event.data === 'reload') window.location.reload();
  };
})();
</script>
`;

const sseClients = new Set();

function resolveSafePath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname.split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const fullPath = path.resolve(ROOT, relative);
  if (!fullPath.startsWith(ROOT + path.sep) && fullPath !== ROOT) {
    return null;
  }
  return fullPath;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    return res.end('Bad Request');
  }

  if (req.url === '/__live_reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write(': connected\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  let filePath = resolveSafePath(req.url);
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (statErr, stats) => {
    if (!statErr && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      if (ext === '.html') {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        const html = data.toString('utf8').replace('</body>', `${LIVE_RELOAD_SCRIPT}</body>`);
        return res.end(html);
      }

      if (req.headers.range && (ext === '.mp3' || ext === '.pdf')) {
        const match = /bytes=(\d+)-(\d*)/.exec(req.headers.range);
        if (match) {
          const start = Number(match[1]);
          const end = match[2] ? Math.min(Number(match[2]), data.length - 1) : data.length - 1;
          if (start <= end && start < data.length) {
            const chunk = data.subarray(start, end + 1);
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${data.length}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunk.length,
              'Content-Type': contentType
            });
            return res.end(chunk);
          }
        }
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': data.length,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  });
});

let reloadTimer = null;
try {
  fs.watch(ROOT, { persistent: false }, (_event, filename) => {
    if (!filename || !/\.(html|css|js)$/i.test(filename)) return;
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      for (const client of sseClients) {
        client.write('data: reload\n\n');
      }
    }, 100);
  });
} catch {
  // Ignore file watch failures on restricted filesystems.
}

server.listen(PORT, HOST, () => {
  console.log(`TNS Landing Page live server running at http://${HOST}:${PORT}/`);
});
