const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const ROOT_DIR = path.resolve(__dirname, '..');

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
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
    '.apk': 'application/vnd.android.package-archive'
};

// Security headers applied to every dev response
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
};

/**
 * Validates and resolves a URL path to a safe filesystem path.
 * Prevents path traversal attacks by ensuring the resolved path
 * stays within the project root directory.
 * Returns null if the path is invalid or attempts traversal.
 */
function resolveSafePath(urlPath) {
    // Decode percent-encoded characters, then normalize
    let decoded;
    try {
        decoded = decodeURIComponent(urlPath);
    } catch (err) {
        return null; // Malformed percent-encoding
    }

    // Block null bytes (path truncation attack)
    if (decoded.indexOf('\0') !== -1) return null;

    // Resolve to absolute path
    const resolved = path.resolve(ROOT_DIR, '.' + decoded);

    // Ensure the resolved path is within the project root (jail)
    if (!resolved.startsWith(ROOT_DIR + path.sep) && resolved !== ROOT_DIR) {
        return null;
    }

    return resolved;
}

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Only allow GET and HEAD methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, SECURITY_HEADERS);
        res.end();
        return;
    }

    // Normalize URL — strip query string and hash
    let urlPath = req.url.split('?')[0].split('#')[0];
    if (urlPath === '/') {
        urlPath = '/index.html';
    }

    let filePath = resolveSafePath(urlPath);

    // If path validation failed, return 400
    if (!filePath) {
        res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
        res.end('Bad Request');
        return;
    }

    // Auto-append .html if path has no extension and isn't a directory
    if (!path.extname(filePath)) {
        filePath += '.html';
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Serve 404
            fs.readFile(path.join(ROOT_DIR, '404.html'), (err404, content) => {
                res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content || '404 Not Found', 'utf-8');
            });
            return;
        }

        const ext = String(path.extname(filePath)).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                // Generic error — never expose internal details
                res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, {
                    ...SECURITY_HEADERS,
                    'Content-Type': contentType.startsWith('text/') || contentType === 'application/json' 
                        ? `${contentType}; charset=utf-8` 
                        : contentType
                });
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`  Dev server running at: http://localhost:${PORT}`);
    console.log(`=========================================\n`);
});
