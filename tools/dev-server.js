const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Normalize URL
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') {
        urlPath = '/index.html';
    }

    let filePath = path.join(path.join(__dirname, '..'), urlPath);

    // Auto-append .html if path has no extension and isn't a directory
    if (!path.extname(filePath)) {
        filePath += '.html';
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Serve 404
            fs.readFile(path.join(path.join(__dirname, '..'), '404.html'), (err404, content) => {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(content || '404 Not Found', 'utf-8');
            });
            return;
        }

        const ext = String(path.extname(filePath)).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            } else {
                res.writeHead(200, {
                    'Content-Type': contentType.startsWith('text/') || contentType === 'application/json' 
                        ? `${contentType}; charset=utf-8` 
                        : contentType,
                    'Cache-Control': 'no-cache'
                });
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 Dev server running at: http://localhost:${PORT}`);
    console.log(`=========================================\n`);
});
