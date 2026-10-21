const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Parse URL and strip query strings or hash
  let reqPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Prevent directory traversal
  let safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // If directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const notFoundPath = path.join(PUBLIC_DIR, '404.html');
        if (fs.existsSync(notFoundPath)) {
          const notFound = fs.readFileSync(notFoundPath);
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(notFound);
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`Server Error: ${err.code}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 BYN Website Local Server is running!`);
  console.log(`📡 Local URL:   http://localhost:${PORT}`);
  console.log(`📂 Serving:     ${PUBLIC_DIR}`);
  console.log(`⌨️  Press Ctrl+C to stop the server.\n`);
});
