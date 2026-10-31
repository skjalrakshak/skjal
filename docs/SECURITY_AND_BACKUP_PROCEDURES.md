# SKJAL Security, Privacy, and Disaster Recovery Standard Operating Procedures

**Entity:** SK Jalrakshak Innovations Private Limited (SKJAL)  
**Corporate Identification Number (CIN):** U26517AP2025PTC119413  
**Engineering Headquarters:** Visakhapatnam, Andhra Pradesh, India  
**Applicability:** Production Web Infrastructure, Telemetry Pipelines, and Data Privacy Operations  
**Effective Date:** October 31, 2026  

---

## 1. HTTPS Enforcement and HTTP Strict Transport Security (HSTS)

SKJAL enforces encrypted communications across all public endpoints, cloud telemetry portals, and API gateways.

### 1.1 Protocol Requirements
- **TLS Version:** TLS 1.3 enforced (TLS 1.2 minimum acceptable fallback; SSLv3, TLS 1.0, and TLS 1.1 strictly blocked).
- **Certificate Authority:** Managed Automated Certificate Management Environment (ACME) certificates with 2048-bit RSA / 256-bit ECDSA cryptographic keypairs and 90-day automated renewals.
- **Port 80 Insecure Traffic:** All inbound unencrypted HTTP traffic on port 80 is immediately redirected via permanent HTTP 301 redirects to canonical HTTPS: `https://www.skjal.in/`.

### 1.2 HSTS Implementation
The HSTS directive instructs user agents to only communicate over HTTPS for a minimum duration of two calendar years, protecting visitors against SSL-stripping attacks, man-in-the-middle exploits, and protocol downgrade vulnerabilities:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### 1.3 Configuration Files Implemented in Codebase
1. **Vercel Edge Gateway:** [vercel.json](file:///c:/Users/koush/OneDrive/Desktop/skjal/vercel.json)
2. **Netlify / Cloudflare Pages:** [_headers](file:///c:/Users/koush/OneDrive/Desktop/skjal/_headers)
3. **Apache / LiteSpeed Web Servers:** [.htaccess](file:///c:/Users/koush/OneDrive/Desktop/skjal/.htaccess)

---

## 2. Hardened Security Headers Matrix

The website implements defense-in-depth HTTP response headers across all routes:

| Header Name | Configured Production Value | Security Protection Purpose |
| :--- | :--- | :--- |
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | Forces perpetual HTTPS encryption and qualifies for browser preload lists. |
| **X-Content-Type-Options** | `nosniff` | Prevents browsers from MIME-sniffing away from the declared Content-Type. |
| **X-Frame-Options** | `DENY` | Completely prevents clickjacking by forbidding iframe rendering. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Protects visitor URL privacy when navigating to external destinations. |
| **Cross-Origin-Opener-Policy** | `same-origin` | Isolates the browsing context to defend against Spectre-class microarchitectural leaks. |
| **Cross-Origin-Resource-Policy** | `same-site` | Restricts resource loading to identical origins. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=(), payment=(), ...` | Restricts hardware browser capabilities not required for website operation. |
| **Content-Security-Policy** | `default-src 'none'; script-src 'self' ...; style-src 'self' ...; img-src 'self' data: ...;` | Restricts script execution, styles, and image origins to prevent Cross-Site Scripting (XSS). |

---

## 3. Privacy Notice, Cookie Governance, and DPDPA Compliance

In accordance with India's **Digital Personal Data Protection Act, 2023 (DPDPA)** and international enterprise procurement standards, SKJAL operates transparent data protection policies:

### 3.1 Standalone Privacy Notice
A complete, standalone Privacy Notice is published at `/privacy` ([privacy.html](file:///c:/Users/koush/OneDrive/Desktop/skjal/privacy.html)), providing:
- Explicit itemization of collected data categories (commercial RFQs vs automated server logs).
- Separation of public website traffic from client-owned proprietary industrial telemetry streams.
- Formal retention schedules (24 months for commercial inquiries, 90 days for firewall/access logs).
- Complete data subject rights under DPDPA 2023 (Access, Rectification, Erasure, Grievance Redressal, Nomination).
- Designated Data Protection Officer contact desk: `privacy@skjal.in` (+91 89788 59246).

### 3.2 Cookie Consent Banner Architecture
1. **Strictly Essential vs Non-Essential**:
   - The site operates essential functionality without tracking.
   - Non-essential performance and analytics scripts are **blocked by default** and execute **ONLY after affirmative consent**.
2. **Explicit Choices**:
   - The cookie consent banner provides equal prominence to `Accept All` and `Reject Non-Essential`.
3. **Dynamic Consent Withdrawal**:
   - Visitors can withdraw or modify their consent at any time via:
     - The persistent `Cookie Settings` link in the footer of every page.
     - The interactive preference management widget embedded in [privacy.html](file:///c:/Users/koush/OneDrive/Desktop/skjal/privacy.html#manage-cookies).

### 3.3 Recommendation for Legal Review
> [!IMPORTANT]
> This Privacy Notice and Cookie Policy is maintained by SK Jalrakshak Innovations Private Limited for regulatory transparency. Formal legal review by specialized corporate counsel is recommended prior to signing customized enterprise OEM data-sharing contracts.

---

## 4. Daily Automated Backup Engine

SKJAL maintains an automated backup utility that packages all website source files, static assets, images, and server configurations into integrity-checksummed archives.

### 4.1 Backup Script Execution
The backup utility is implemented in [tools/backup.js](file:///c:/Users/koush/OneDrive/Desktop/skjal/tools/backup.js).

**Manual Invocation:**
```bash
node tools/backup.js
```

**Output Archive Structure:**
```
backups/
└── backup_2026-10-31T11-37-08-817Z/
    ├── manifest.json       <-- SHA-256 hashes and metadata for every file
    ├── index.html
    ├── water-monitoring.html
    ├── energy-monitoring.html
    ├── custom-engineering.html
    ├── shield.html
    ├── privacy.html
    ├── 404.html
    ├── vercel.json
    ├── robots.txt
    ├── sitemap.xml
    └── assets/
```

### 4.2 Automated Scheduling (Cron / Windows Task Scheduler)
- **Linux / macOS Cron (Daily at 02:00 AM IST):**
  ```bash
  0 2 * * * cd /path/to/skjal && /usr/bin/node tools/backup.js >> /var/log/skjal_backup.log 2>&1
  ```
- **Windows Task Scheduler (PowerShell command):**
  ```powershell
  schtasks /create /tn "SKJAL_Daily_Backup" /tr "node C:\Users\koush\OneDrive\Desktop\skjal\tools\backup.js" /sc daily /st 02:00
  ```

---

## 5. Tested Restoration and Rollback Procedures

Disaster recovery is automated via [tools/restore.js](file:///c:/Users/koush/OneDrive/Desktop/skjal/tools/restore.js).

### 5.1 Verification Mode (Dry Run)
Before restoring any archive, the tool re-computes the SHA-256 hash of every archived file and verifies it against the archived `manifest.json`:
```bash
node tools/restore.js
```
*Expected Output:*
```
[VERIFY] Validating archive: backup_2026-10-31T...
[VERIFY] 49 files verified matching SHA256 checksums.
[PASS] Backup archive is 100% integral and ready for rollback/restoration.
```

### 5.2 Performing an Active Production Rollback
To restore a specific verified backup into the production workspace:
```javascript
const { restoreBackup } = require('./tools/restore');
// Active rollback (replaces current files with verified snapshot)
restoreBackup('backup_2026-10-31T11-37-08-817Z', false);
```

---

## 6. Claims Verification & Advertising Compliance Audit

To comply with the Advertising Standards Council of India (ASCI) and technical procurement integrity, the following claims have been audited and corrected:

1. **Zero Data Loss Guarantee**: Removed absolute guarantee; replaced with verified store-and-forward local non-volatile flash storage buffering.
2. **Auto-Calibration**: Clarified actual calibration routine: manual buffer calibration (2-point/3-point) with Over-The-Air (OTA) software offset calibration support.
3. **Sensor Counts per Station**: Accurately itemizes core parameters (pH, TDS, Optical DO, Turbidity, Temperature) with optional RS485 expansion ports.
4. **Ingress Protection (IP67/IP68)**: Enclosures are specified accurately (IP68 submersible sensor probe array; IP67 weatherproof electronics enclosure) with test documentation available on request.
5. **CPCB/SPCB Compliance**: Clarified as data export and telemetry formatting aligned with pollution control board monitoring guidelines, not hardware accreditation.
6. **Solar Autonomy**: Replaced "100% solar self-sustainable" with verified battery autonomy: 3 to 5 days continuous operation via high-cycle LiFePO4 battery pack under overcast conditions.
7. **Zero Latency**: Removed "zero latency" claims; replaced with low-latency edge computing and deterministic telemetry sampling.
8. **ISO 2631-1 & Medical Claims**: Removed unsupported claims regarding spinal injury prevention; positioned strictly as occupational vibration and cabin shock telemetry adhering to ISO 2631-1 guidelines.
9. **Driver Fatigue**: Replaced PERCLOS eye-closure claims with actual telemetry: continuous driving duration monitoring and in-cabin audio rest break prompts.
10. **Partner Logos**: Changed "Trusted by enterprises" to "Research & Ecosystem Collaborators" (KLTIF, Satya Sri Electricals, Make in India).

---

## 7. Automated Vulnerability Scan Remediation & Host-Level TLS Hardening

Following an automated DAST / vulnerability scan of the production infrastructure, five specific categories were identified and remediated:

| Scan Finding Category | Count | Codebase / Server Action Taken | Resolution Status |
| :--- | :---: | :--- | :--- |
| **Content Security Policy Configuration** | 1 | Removed deprecated `block-all-mixed-content`. Removed unused third-party CDNs (`unpkg.com`, `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`) and image origins (`randomuser.me`, `unsplash.com`, `cloudinary.com`) to eliminate CDN bypass vectors. Restriced to `'self'`, Google Fonts, and local assets. | **RESOLVED in `_headers`, `vercel.json`, `.htaccess`** |
| **Clickjacking Protection** | 1 | Dual protection implemented: `X-Frame-Options: DENY` (sent via `Header always set` and `Header set`) and CSP `frame-ancestors 'none'`. | **RESOLVED in `_headers`, `vercel.json`, `.htaccess`** |
| **MIME Type Confusion** | 1 | Enforced `X-Content-Type-Options: nosniff` across all responses (including 200, 301 redirects, and 404 error pages). | **RESOLVED in `_headers`, `vercel.json`, `.htaccess`** |
| **Inconsistent Redirection** | 1 | Added canonical single-hop 301 redirection from non-www (`https://skjal.in` and `http://skjal.in`) directly to `https://www.skjal.in/` to eliminate split routing. | **RESOLVED in `vercel.json` & `.htaccess`** |
| **TLS/SSL Misconfigurations** | 4 / 8 | Server/edge certificate parameters. Requires host-level configuration in Cloudflare, Vercel, or Web Server (see Section 7.1). | **DOCUMENTED in Section 7.1 below** |

### 7.1 Server-Side TLS/SSL Hardening Guide (For Hosting / CDN Administrator)

To resolve the remaining 4 server-level TLS findings, apply the following configurations in your hosting environment (Cloudflare, cPanel, Apache, or Nginx):

#### A. In Cloudflare / CDN Edge:
1. **Minimum TLS Version:** Navigate to **SSL/TLS > Edge Certificates** and set **Minimum TLS Version** to **TLS 1.2** (or TLS 1.3).
2. **Disable Weak Ciphers:** Disable TLS 1.0 and TLS 1.1 completely.
3. **Always Use HTTPS:** Ensure **Always Use HTTPS** toggle is enabled.
4. **HSTS Preload:** Ensure HSTS is enabled with `max-age: 63072000`, `Include subdomains`, and `Preload` checked.
5. **Opportunistic Encryption & TLS 1.3:** Enable **TLS 1.3** and **Automatic HTTPS Rewrites**.

#### B. In Apache / LiteSpeed (`ssl.conf` / VirtualHost):
```apache
# 1. Enforce TLS 1.2 and 1.3 Only (Disable SSLv2, SSLv3, TLS 1.0, TLS 1.1)
SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1

# 2. Modern Cipher Suite (Forward Secrecy & AEAD Only)
SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
SSLHonorCipherOrder on

# 3. Enable OCSP Stapling (RFC 6066)
SSLUseStapling on
SSLStaplingCache "shmcb:logs/ssl_stapling(32768)"
```

#### C. In Nginx (`/etc/nginx/conf.d/skjal.conf`):
```nginx
# 1. Modern Protocols Only
ssl_protocols TLSv1.2 TLSv1.3;

# 2. Strong Ciphers with Forward Secrecy
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;

# 3. OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 1.1.1.1 8.8.8.8 valid=300s;
resolver_timeout 5s;
```

#### D. In DNS Records (DNS Zone for `skjal.in`):
Add a **CAA (Certificate Authority Authorization)** record to restrict which CAs may issue certificates for your domain:
```dns
skjal.in.  IN  CAA  0 issue "letsencrypt.org"
skjal.in.  IN  CAA  0 issue "digicert.com"
skjal.in.  IN  CAA  0 issuewild ";"
skjal.in.  IN  CAA  0 iodef "mailto:security@skjal.in"
```

