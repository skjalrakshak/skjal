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

const REDIRECTS = {
    '/services': '/#services',
    '/services.html': '/#services',
    '/industries': '/#industries',
    '/industries.html': '/#industries',
    '/about': '/#about',
    '/about.html': '/#about',
    '/contact': '/#contact',
    '/contact.html': '/#contact',
    '/jal-rakshak': '/water-monitoring.html',
    '/jal-rakshak.html': '/water-monitoring.html',
    '/water-monitoring-vizag': '/water-monitoring.html',
    '/water-monitoring-vizag.html': '/water-monitoring.html',
    '/energy-monitoring-vizag': '/energy-monitoring.html',
    '/energy-monitoring-vizag.html': '/energy-monitoring.html',
    '/products': '/water-monitoring.html',
    '/products.html': '/water-monitoring.html',
    '/resources': '/water-monitoring.html',
    '/resources.html': '/water-monitoring.html'
};

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Vary': 'Accept-Encoding'
};

function resolveSafePath(urlPath) {
    let decoded;
    try {
        decoded = decodeURIComponent(urlPath);
    } catch (err) {
        return null;
    }

    if (decoded.indexOf('\0') !== -1) return null;

    const resolved = path.resolve(ROOT_DIR, '.' + decoded);
    if (!resolved.startsWith(ROOT_DIR + path.sep) && resolved !== ROOT_DIR) {
        return null;
    }

    return resolved;
}

const server = http.createServer((req, res) => {
    // Only allow GET and HEAD methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, SECURITY_HEADERS);
        res.end();
        return;
    }

    // Normalize URL — strip query string and hash
    let urlPath = req.url.split('?')[0].split('#')[0];

    // Check automatic section & page redirections
    if (REDIRECTS[urlPath]) {
        console.log(`[302 Redirect] ${urlPath} -> ${REDIRECTS[urlPath]}`);
        res.writeHead(302, {
            'Location': REDIRECTS[urlPath],
            'Cache-Control': 'public, max-age=3600'
        });
        res.end();
        return;
    }

    if (urlPath === '/') {
        urlPath = '/index.html';
    }

    let filePath = resolveSafePath(urlPath);

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

        // Development Server: No-cache for active development files (instant live updates)
        let cacheHeader = 'no-cache, no-store, must-revalidate';
        if (['.webp', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf'].includes(ext)) {
            cacheHeader = 'public, max-age=3600';
        }

        const etag = `"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;
        if (req.headers['if-none-match'] === etag) {
            res.writeHead(304, {
                'ETag': etag,
                'Cache-Control': cacheHeader
            });
            res.end();
            return;
        }

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, {
                    ...SECURITY_HEADERS,
                    'ETag': etag,
                    'Cache-Control': cacheHeader,
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
