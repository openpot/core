const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3005;
const OUT_DIR = path.join(__dirname, '..', 'out');
const certDir = path.join(__dirname, '..', '.certs');

const options = {
  key: fs.readFileSync(path.join(certDir, 'openpot-local-dev.key')),
  cert: fs.readFileSync(path.join(certDir, 'openpot-local-dev.crt')),
};

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain',
  '.wasm': 'application/wasm',
};

const isPathWithinRoot = (root, targetPath) => {
  const relative = path.relative(root, targetPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative) || relative === '';
};

const server = https.createServer(options, (req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname || '/';

  try {
    pathname = decodeURIComponent(pathname);
  } catch (_) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }
  
  const requestPath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.resolve(OUT_DIR, `.${requestPath}`);

  if (!isPathWithinRoot(OUT_DIR, filePath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // 1. Force directory requests to index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.resolve(filePath, 'index.html');
    if (!isPathWithinRoot(OUT_DIR, indexPath)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    filePath = indexPath;
  }
  
  // 2. Handle Next.js 'trailingSlash: true' cleaner: if a path doesn't have an extension
  // and isn't a directory, it might be a clean URL that needs /index.html
  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    const indexPath = path.resolve(filePath, 'index.html');
    if (isPathWithinRoot(OUT_DIR, indexPath) && fs.existsSync(indexPath)) {
      filePath = indexPath;
    }
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT') {
        fs.readFile(path.join(OUT_DIR, '404.html'), (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content404 || '404 Not Found', 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
    } else {
      // PROMPT: Ensure the entry point (HTML) is NEVER cached to prevent "Zombie App" states
      if (extname === '.html') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (pathname.startsWith('/_next/static/') || pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webmanifest|txt)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
      
      // Standard Security Headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('X-Service-Worker-Allowed', '/');

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Openpot Strictly-Privacy PWA Server (HTTPS)`);
  console.log(`Listening on: https://localhost:${PORT}`);
  console.log(`Serving from: ${OUT_DIR}\n`);
});
