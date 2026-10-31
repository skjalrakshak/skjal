# SK Jalrakshak Innovations Private Limited (SKJAL)

> **Enterprise Industrial IoT, Edge Telemetry & Hardware Engineering Platform**  
> Visakhapatnam, Andhra Pradesh, India &bull; CIN: U26517AP2025PTC119413 &bull; [https://www.skjal.in](https://www.skjal.in)

[![Vercel Production](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://www.skjal.in/)
[![Security Grade](https://img.shields.io/badge/Security_Score-Grade_A+-success?style=for-the-badge&logo=shield)](https://www.skjal.in/)
[![Tech Stack](https://img.shields.io/badge/Tech_Stack-Vanilla_HTML5_|_CSS3_|_GSAP_|_Lenis-0A0A0A?style=for-the-badge)](https://www.skjal.in/)
[![Zero NPM Dependencies](https://img.shields.io/badge/Dependencies-Zero_NPM_Runtime-brightgreen?style=for-the-badge)](https://www.skjal.in/)

---

## 1. Project Overview

SKJAL is the official digital engineering and product showcase platform for **SK Jalrakshak Innovations Private Limited**. The website serves as a high-precision, production-grade showcase for industrial telemetry products, environmental sensing, commercial vehicle fleet safety systems, and custom embedded engineering.

The platform is engineered with a **zero-framework, zero-runtime-dependency** vanilla architecture that delivers instantaneous initial paint times, buttery-smooth inertial scrolling, and a signature cinematic curved curtain page transition engine.

---

## 2. Technology Stack & Architectural Principles

- **Markup & Semantics**: Pure HTML5 with strict semantic hierarchy, Schema.org JSON-LD structured data (`Organization`, `Product`, `Service`, `BreadcrumbList`, `FAQPage`), and complete Open Graph / Twitter Card instrumentation.
- **Styling**: Single production CSS bundle ([style.css](file:///c:/Users/koush/OneDrive/Desktop/skjal/assets/css/style.css)) utilizing standard CSS Custom Properties, disciplined modular scaling, and hardware-accelerated GPU transitions (`will-change: transform`).
- **Motion & Interaction**: [GSAP 3](https://greensock.com/gsap/) with [ScrollTrigger](https://greensock.com/scrolltrigger/) for high-performance scroll-driven entrance reveals.
- **Inertial Scrolling Engine**: [Lenis](https://lenis.studiofreight.com/) mathematical inertial smooth scrolling synchronized with ScrollTrigger.
- **Global Page Transition Engine**: Custom self-contained continuous transition controller ([page-transition.js](file:///c:/Users/koush/OneDrive/Desktop/skjal/assets/js/page-transition.js)) featuring dynamic curtain overlays, curved SVG sweeps, centered animated brand typography, in-memory HTML prefetching, and zero document unload (zero white blink).
- **Navigation Resilience**: Document-level event delegation across all mobile hamburger menus, accordion panels, and desktop navigation dropdowns, ensuring uninterrupted functionality across unlimited page transitions.
- **Edge Deployment**: Optimized for Vercel Edge with clean extensionless routing (`cleanUrls`), immutable static asset caching, and strict HTTP response headers.

---

## 3. Directory Structure

```text
skjal/
├── index.html                  # Primary hub (industrial IoT, products overview, services, FAQ)
├── water-monitoring.html       # Product: Water Quality & Environmental Telemetry (Jal Rakshak)
├── energy-monitoring.html      # Product: Industrial Energy Monitoring & 3-Phase Power Quality
├── custom-engineering.html     # Service: Custom PCB Design, Firmware & Turnkey Gateways
├── shield.html                 # Product: S.H.I.E.L.D. Commercial Fleet Driver Safety & Telemetry
├── privacy.html                # Privacy Notice, Cookie Policy & Consent Preference Center
├── 404.html                    # Custom 404 Error Handler with navigation recovery
├── favicon.ico                 # Standard multi-resolution favicon
├── robots.txt                  # Search engine and generative AI indexing rules
├── sitemap.xml                 # XML sitemap with image metadata and canonical URLs
├── sw.js                       # Service Worker for offline resilience & network-first caching
├── vercel.json                 # Vercel Edge configuration (cleanUrls, headers, 301 redirects)
├── _headers                    # Static edge server headers (Cloudflare Pages / Netlify compatible)
├── .htaccess                   # Apache server configuration (HTTPS enforcement, clean URLs, CSP)
├── .gitignore                  # Git exclusion rules for backups, logs, and environments
├── .vercelignore               # Vercel deployment exclusions for tools, docs, and backups
├── package.json                # Project manifest and developer command scripts
├── README.md                   # Authoritative engineering documentation
├── assets/
│   ├── css/
│   │   └── style.css           # Core stylesheet (design system, layouts, responsive rules)
│   ├── fonts/                  # Self-hosted web fonts (Pixelify Sans, PP Neue Montreal)
│   ├── img/                    # High-efficiency WebP imagery, brand assets, and product photos
│   └── js/
│       ├── main.js             # UI controllers, mobile menu delegation, Lenis, and GSAP
│       ├── page-transition.js  # Global self-contained curved curtain transition engine
│       └── vendor/             # Locally bundled vendor libraries (GSAP, ScrollTrigger, Lenis)
├── docs/
│   └── SECURITY_AND_BACKUP_PROCEDURES.md # Security policy and snapshot procedures
└── tools/
    ├── audit.js                # Deep audit suite (DOM structure, images, links, sitemap)
    ├── backup.js               # Automated backup snapshot engine
    ├── restore.js              # Snapshot verification and restore tool
    ├── check-links.js          # Internal anchor and link integrity checker
    ├── clean-urls.js           # URL normalization verification script
    ├── dev-server.js           # Zero-dependency local Node.js development server
    ├── test-server.js          # Route, redirection, and HTTP header test harness
    └── validate-seo.js         # Comprehensive SEO, meta tag, and JSON-LD validator
```

---

## 4. Canonical Routing & Redirection Matrix

All public endpoints are strictly extensionless and served over HTTPS:

| Requested Path | HTTP Status | Canonical Destination | Description |
| :--- | :---: | :--- | :--- |
| `https://skjal.in/*` | 301 | `https://www.skjal.in/*` | Single-hop non-www to www redirect |
| `http://*` | 301 | `https://www.skjal.in/*` | Single-hop HTTP to HTTPS enforcement |
| `/index.html` | 301 | `/` | Clean homepage URL normalization |
| `/water-monitoring.html` | 301 | `/water-monitoring` | Clean URL enforcement |
| `/shield.html` | 301 | `/shield` | Clean URL enforcement |
| `/energy-monitoring.html` | 301 | `/energy-monitoring` | Clean URL enforcement |
| `/custom-engineering.html` | 301 | `/custom-engineering` | Clean URL enforcement |
| `/privacy.html` | 301 | `/privacy` | Clean URL enforcement |
| `/services`, `/services.html` | 301 | `/#services` | Deep-link hash shortcut |
| `/industries`, `/industries.html`| 301 | `/#industries` | Deep-link hash shortcut |
| `/about`, `/about.html` | 301 | `/#about` | Deep-link hash shortcut |
| `/contact`, `/contact.html` | 301 | `/#contact` | Deep-link hash shortcut |
| `/jal-rakshak` | 301 | `/water-monitoring` | Legacy product alias redirect |
| `/water-monitoring-vizag` | 301 | `/water-monitoring` | Geo-targeted legacy alias redirect |
| `/energy-monitoring-vizag` | 301 | `/energy-monitoring` | Geo-targeted legacy alias redirect |

---

## 5. Security & HTTP Header Strategy

The website achieves an **ImmuniWeb Grade A+** security rating through strict header enforcement in [vercel.json](file:///c:/Users/koush/OneDrive/Desktop/skjal/vercel.json), [_headers](file:///c:/Users/koush/OneDrive/Desktop/skjal/_headers), and [.htaccess](file:///c:/Users/koush/OneDrive/Desktop/skjal/.htaccess):

- **Content-Security-Policy (CSP Level 3)**:
  `default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.skjal.in; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto: https://wa.me; upgrade-insecure-requests`
- **HTTP Strict Transport Security (HSTS)**: `max-age=63072000; includeSubDomains; preload`
- **Anti-Clickjacking**: `X-Frame-Options: DENY` paired with inline JavaScript frame-busting on all pages.
- **MIME Sniffing Prevention**: `X-Content-Type-Options: nosniff`
- **Referrer Policy**: `strict-origin-when-cross-origin`
- **Cross-Origin Protection**: `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-site`
- **Permissions Policy**: Camera, microphone, geolocation, and invasive APIs explicitly disabled (`=()`).

---

## 6. Caching & Persistence Architecture

- **HTML Pages & Dynamic Routes**: `public, max-age=0, must-revalidate` (guarantees fresh content on every direct load or revalidation).
- **Service Worker (`sw.js`)**: Strictly network-first for HTML, CSS, and JS navigation; bypasses `localhost` in development to prevent stale caches during editing. Cache store: `skjal-cache-v54-live`.
- **Static Assets (`assets/img/*`, `assets/fonts/*`)**: `public, max-age=31536000, immutable`.
- **Styles & Scripts**: Version-queried query strings (`?v=...`) combined with `public, max-age=86400, stale-while-revalidate=604800`.
- **Application Storage**: Zero tracking cookies set by JavaScript; `localStorage` strictly utilized for `skjal_visited` (preloader state) and `skjal_cookie_consent` with complete error handling.

---

## 7. Local Development & Operational Commands

### Prerequisites
- Node.js installed (v16+ recommended).
- Zero external package installation required (`npm install` is not necessary).

### Boot Local Development Server
```bash
npm run dev
# Starts zero-dependency HTTP dev server on http://localhost:5173
```

### Run Quality Assurance & Audit Suites
```bash
# 1. Syntax check JavaScript
node -c assets/js/page-transition.js assets/js/main.js

# 2. Deep DOM, image, and link audit
node tools/audit.js

# 3. Comprehensive SEO and structured data verification
node tools/validate-seo.js

# 4. Internal anchor and route checker
node tools/check-links.js
```

### Create Automated Backup Snapshot
```bash
node tools/backup.js
# Generates timestamped snapshot in backups/ (ignored by Git and Vercel)
```

---

## 8. Deployment Workflow

Deployments are triggered automatically upon pushing to the `main` branch:

```bash
git add .
git commit -m "feat: description of changes"
git push origin main
```

---

## 9. Contact & Enterprise Details

- **Company**: SK Jalrakshak Innovations Private Limited
- **CIN**: U26517AP2025PTC119413
- **Registered Lab**: Visakhapatnam, Andhra Pradesh, India
- **Sales & Engineering**: [sales@skjal.in](mailto:sales@skjal.in)
- **WhatsApp Support**: [+91 89788 59246](https://wa.me/918978859246)
- **Official Website**: [https://www.skjal.in](https://www.skjal.in)
