const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const zlib = require("zlib");

const root = __dirname;
const startPort = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";

const redirects = new Map([
  ["/home", "/#home"],
  ["/about", "/#about"],
  ["/systems", "/#systems"],
  ["/services", "/#systems"],
  ["/technology", "/#architecture"],
  ["/tech", "/#architecture"],
  ["/platform", "/#architecture"],
  ["/architecture", "/#architecture"],
  ["/work", "/#systems"],
  ["/use-cases", "/#story"],
  ["/field-story", "/#story"],
  ["/company", "/#contact"],
  ["/contact", "/#contact"],
  ["/pricing", "/#systems"]
]);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".cjs": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".apk": "application/vnd.android.package-archive"
};

const buckets = new Map();
const windowMs = 30_000;
const maxRequests = 120;

function cleanBuckets(now) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.started > windowMs * 2) buckets.delete(key);
  }
}

function rateLimit(req) {
  const now = Date.now();
  const ip = req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "local";
  const bucket = buckets.get(ip) || { started: now, count: 0 };

  if (now - bucket.started > windowMs) {
    bucket.started = now;
    bucket.count = 0;
  }

  bucket.count += 1;
  buckets.set(ip, bucket);
  if (buckets.size > 500) cleanBuckets(now);

  return bucket.count <= maxRequests;
}

function securityHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com https://cdn.tailwindcss.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://randomuser.me https://images.unsplash.com https://res.cloudinary.com https://i.pravatar.cc",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self' mailto:",
      "upgrade-insecure-requests"
    ].join("; ")
  };
}

function send(res, status, body, headers = {}) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const etag = `"${crypto.createHash("sha1").update(payload).digest("hex")}"`;
  const acceptsGzip = /\bgzip\b/.test(headers.acceptEncoding || "");
  const responseHeaders = { ...headers, ETag: etag };
  delete responseHeaders.acceptEncoding;

  if (acceptsGzip && /^text\/|javascript|json|svg/.test(responseHeaders["Content-Type"] || "")) {
    const compressed = zlib.gzipSync(payload);
    res.writeHead(status, {
      ...responseHeaders,
      "Content-Encoding": "gzip",
      "Content-Length": compressed.length
    });
    res.end(compressed);
    return;
  }

  res.writeHead(status, {
    ...responseHeaders,
    "Content-Length": payload.length
  });
  res.end(payload);
}

function resolveFile(urlPath) {
  let pathname = decodeURIComponent(urlPath.split("?")[0]);
  
  if (pathname !== "/" && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const cleaned = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(cleaned).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  let absolute = path.join(root, normalized);

  const safeRoot = root.endsWith(path.sep) ? root : root + path.sep;
  if (absolute !== root && !absolute.startsWith(safeRoot)) return null;

  if (!fs.existsSync(absolute) && fs.existsSync(absolute + ".html")) {
    return absolute + ".html";
  }

  return absolute;
}

function serve404(req, res) {
  const file = path.join(root, "404.html");
  const body = fs.existsSync(file) ? fs.readFileSync(file) : "404";
  send(res, 404, body, {
    ...securityHeaders("text/html; charset=utf-8"),
    "Cache-Control": "no-store",
    acceptEncoding: req.headers["accept-encoding"] || ""
  });
}

function handler(req, res) {
  if (!rateLimit(req)) {
    send(res, 429, "Too many requests. Please slow down.", {
      ...securityHeaders("text/plain; charset=utf-8"),
      "Retry-After": "30"
    });
    return;
  }

  if (!["GET", "HEAD"].includes(req.method)) {
    send(res, 405, "Method not allowed", {
      ...securityHeaders("text/plain; charset=utf-8"),
      Allow: "GET, HEAD"
    });
    return;
  }

  if ((req.url || "").length > 2048) {
    send(res, 414, "URI too long", securityHeaders("text/plain; charset=utf-8"));
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || `${host}:${startPort}`}`);
  const lowerPath = requestUrl.pathname.toLowerCase();

  if (redirects.has(lowerPath)) {
    res.writeHead(308, {
      Location: redirects.get(lowerPath),
      ...securityHeaders("text/plain; charset=utf-8")
    });
    res.end();
    return;
  }

  if (lowerPath.endsWith('.html') && lowerPath !== '/404.html') {
    const cleanPath = lowerPath === '/index.html' ? '/' : lowerPath.replace(/\.html$/, '');
    res.writeHead(308, {
      Location: cleanPath,
      ...securityHeaders("text/plain; charset=utf-8")
    });
    res.end();
    return;
  }

  if (lowerPath === "/health") {
    send(res, 200, JSON.stringify({ ok: true }), {
      ...securityHeaders("application/json; charset=utf-8"),
      "Cache-Control": "no-store"
    });
    return;
  }

  try {
    const file = resolveFile(requestUrl.pathname);
    if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      serve404(req, res);
      return;
    }

    const ext = path.extname(file).toLowerCase();
    const body = fs.readFileSync(file);
    const isStaticAsset = /\.(css|js|png|jpg|jpeg|webp|svg|ico)$/.test(ext);

    const responseHeaders = {
      ...securityHeaders(mimeTypes[ext] || "application/octet-stream"),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      acceptEncoding: req.headers["accept-encoding"] || ""
    };

    // Force download for APK files
    if (ext === ".apk") {
      responseHeaders["Content-Disposition"] = `attachment; filename="${path.basename(file)}"`;
    }

    send(res, req.method === "HEAD" ? 204 : 200, req.method === "HEAD" ? "" : body, responseHeaders);
  } catch (err) {
    console.error("Error serving request:", err);
    send(res, 500, "Internal Server Error", {
      ...securityHeaders("text/plain; charset=utf-8"),
      "Cache-Control": "no-store"
    });
  }
}

// ── Vercel Serverless Export ──
// Vercel will import this module and call the exported handler directly.
module.exports = handler;

// ── Local Development Server ──
// Only starts the HTTP listener when running locally (not on Vercel).
if (!process.env.VERCEL) {
  function listen(port) {
    const server = http.createServer(handler);

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE" && port < startPort + 20) {
        listen(port + 1);
        return;
      }
      throw error;
    });

    server.listen(port, host, () => {
      console.log(`SK Jalrakshak site running at http://${host}:${port}/`);
    });
  }

  listen(startPort);
}
