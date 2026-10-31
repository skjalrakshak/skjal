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
    '/water-monitoring.html': '/water-monitoring',
    '/energy-monitoring.html': '/energy-monitoring',
    '/custom-engineering.html': '/custom-engineering',
    '/shield.html': '/shield',
    '/jal-rakshak': '/water-monitoring',
    '/jal-rakshak.html': '/water-monitoring',
    '/water-monitoring-vizag': '/water-monitoring',
    '/water-monitoring-vizag.html': '/water-monitoring',
    '/energy-monitoring-vizag': '/energy-monitoring',
    '/energy-monitoring-vizag.html': '/energy-monitoring',
    '/products': '/water-monitoring',
    '/products.html': '/water-monitoring',
    '/resources': '/water-monitoring',
    '/resources.html': '/water-monitoring',
    '/privacy.html': '/privacy'
};

const SECURITY_HEADERS = {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=(), autoplay=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), web-share=(), xr-spatial-tracking=(), interest-cohort=()',
    'Content-Security-Policy': "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.skjal.in; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto: https://wa.me; upgrade-insecure-requests",
    'X-DNS-Prefetch-Control': 'on',
    'X-Permitted-Cross-Domain-Policies': 'none',
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
        res.writeHead(405, { ...SECURITY_HEADERS, 'Allow': 'GET, HEAD' });
        res.end();
        return;
    }

    // Normalize URL — strip query string and hash
    let urlPath = req.url.split('?')[0].split('#')[0];

    // Remove trailing slash for consistency (except root /)
    if (urlPath.length > 1 && urlPath.endsWith('/')) {
        const canonical = urlPath.slice(0, -1);
        res.writeHead(301, {
            ...SECURITY_HEADERS,
            'Location': canonical,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
        });
        res.end();
        return;
    }

    // Check automatic section & page redirections (Single-hop 301 Canonical)
    if (REDIRECTS[urlPath]) {
        console.log(`[301 Redirect] ${urlPath} -> ${REDIRECTS[urlPath]}`);
        res.writeHead(301, {
            ...SECURITY_HEADERS,
            'Location': REDIRECTS[urlPath],
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
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

        // Development Server: Strict No-Cache across all files (instant live updates, zero stale state)
        const cacheHeader = 'no-cache, no-store, must-revalidate';

        const etag = `"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;
        if (req.headers['if-none-match'] === etag) {
            res.writeHead(304, {
                ...SECURITY_HEADERS,
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
