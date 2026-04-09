import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dev = false;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3003', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../.certs/openpot-local-dev.key')),
  cert: fs.readFileSync(path.join(__dirname, '../.certs/openpot-local-dev.crt')),
  ca: fs.readFileSync(path.join(__dirname, '../.certs/openpot-local-dev-ca.crt')),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://localhost:${port}`);
    });
});
