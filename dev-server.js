const http = require('http');
const fs = require('fs');
const path = require('path');
const handler = require('./api/reclamacao.js');
const netlifyHandler = require('./netlify/functions/reclamacao.js').handler;

const root = __dirname;
const port = Number(process.env.PORT || 3000);

function loadEnv() {
  const envPath = path.join(root, '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  lines.forEach((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match) {
      return;
    }

    const key = match[1];
    let value = match[2];

    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
  };

  return types[extension] || 'application/octet-stream';
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.resolve(root, `.${decodeURIComponent(pathname)}`);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
      response.end('Arquivo não encontrado.');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentType(filePath),
    });
    response.end(data);
  });
}

loadEnv();

const server = http.createServer((request, response) => {
  if (request.url.startsWith('/api/reclamacao')) {
    handler(request, response);
    return;
  }

  if (request.url.startsWith('/.netlify/functions/reclamacao')) {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', async () => {
      const result = await netlifyHandler({
        body,
        headers: request.headers,
        httpMethod: request.method,
      });

      response.writeHead(result.statusCode, result.headers);
      response.end(result.body);
    });

    return;
  }

  serveStatic(request, response);
});

server.listen(port, () => {
  console.log(`KORRE rodando em http://localhost:${port}`);
});
