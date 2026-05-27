<div align="center">
  <img src="https://res.cloudinary.com/dv8ruocdg/image/upload/f_auto,q_auto,w_200/skjal/logo.png" alt="SK Jalrakshak Logo" width="150" />
  <h1>SK Jalrakshak Innovations Pvt Ltd</h1>
  <p><strong>Deep Tech IoT & AI Analytics Platform for Water, Energy & Driver Safety</strong></p>

  [![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://www.skjal.in/)
  [![ImmuniWeb Security Grade](https://img.shields.io/badge/Security_Score-Grade_A+-success?style=for-the-badge&logo=shield)](https://www.skjal.in/)
  [![Tech Stack](https://img.shields.io/badge/Tech_Stack-HTML5_|_CSS3_|_GSAP_|_Three.js-blue?style=for-the-badge)]()
  [![SEO Optimized](https://img.shields.io/badge/SEO-Optimized-brightgreen?style=for-the-badge&logo=google)]()

</div>

---

An enterprise-grade, high-performance web platform for **SK Jalrakshak Innovations**. We build advanced AI & IoT systems that monitor energy consumption, protect water infrastructure, and ensure human safety in real-time. The digital platform is engineered for **absolute maximum performance, elite security (A+ rating), and cinematic UX**.

## 🚀 Our Core Ecosystem

### 💧 1. Jal Rakshak (Water Intelligence)
Our flagship AI-driven water intelligence platform. Deploying advanced IoT sensors across India to monitor water quality, detect leaks, and optimize usage in real-time with predictive cloud analytics.

### 🛡️ 2. S.H.I.E.L.D. (Driver Health & Safety)
**S**mart **H**ealth **I**ntelligence for **E**rgonomic & **L**ive **D**riving. A patent-granted AI-powered hardware ecosystem that continuously tracks whole-body vibration exposure, road shock, and driver fatigue to deliver real-time, personalized safety protocols for commercial fleets.

### ⚡ 3. Energy Meter Monitoring
Offering detailed insights into energy consumption patterns across industrial facilities. By identifying inefficiencies and optimizing usage, organizations can significantly reduce energy costs, achieve predictive maintenance, and enhance sustainability.

---

## 🔒 Enterprise Security & Performance

This platform has been rigorously audited and optimized to achieve the highest standards of web performance and security:

* **Security (ImmuniWeb Grade A+)**:
  * Strict Content-Security-Policy (CSP) & Subresource Integrity (SRI) enforcement.
  * HSTS Preload (`max-age=63072000`) & X-Frame-Options configured to block clickjacking.
  * Robust `Cross-Origin-Resource-Policy` setup protecting against cross-site data leaks.
  * Comprehensive `robots.txt` blocking AI scrapers (GPTBot, ClaudeBot, Bytespider, etc.).
* **Performance**:
  * Advanced CSS GPU compositing (`will-change: transform`).
  * Deferred/Async JavaScript execution (Three.js & GSAP) to prevent main-thread blocking.
  * Adaptive reduced-motion (`prefers-reduced-motion`) support for accessibility.
  * Immutable caching headers via Vercel Edge network.
* **SEO Mastery**:
  * Fully instrumented with Open Graph, Twitter Cards, Canonical URLs, and JSON-LD Schema.org structured data.
  * Dynamic `sitemap.xml` properly linked for maximum indexation.

---

## 🛠 Tech Stack & Architecture

- **Frontend:** Vanilla HTML5 & CSS3 (Zero heavy frameworks for instant loading & zero CLS).
- **Motion Engine:** [GSAP 3](https://greensock.com/gsap/) (GreenSock Animation Platform) paired with ScrollTrigger.
- **Smooth Scrolling:** [Lenis](https://lenis.studiofreight.com/) mathematical smooth scroll injected across all pages.
- **3D Rendering:** Three.js for interactive WebGL backgrounds.
- **Routing:** Vercel Clean URLs (extensionless paths).
- **Asset Delivery:** Cloudinary CDN optimized imagery with preload headers and high-fetch priority for zero-lag hero images.

---

## 💻 Local Development

To run the platform locally and see your changes instantly:

1. Clone the repository and navigate to the root directory.
2. Ensure you have Node.js installed.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Boot the custom local development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`.

> **Note:** If you make changes to the routing logic in `server.js`, you must restart the dev server to see the changes.

---

## ☁️ Deployment (Vercel)

This project is perfectly tuned for **Vercel** edge deployment.
- **Clean URLs:** Extensionless routing (`/shield` instead of `/shield.html`) is strictly enforced via the custom `vercel.json` configuration.
- **Security Headers:** All CSP, HSTS, and CORS policies are aggressively applied at the Vercel Edge.
- **Deployment:** Pushing to the `main` branch on GitHub automatically triggers a production deployment.

```bash
git add .
git commit -m "feat: new updates"
git push
```

---

## 📁 Repository Structure

```text
├── index.html                  # Landing Page
├── jal-rakshak.html            # Product: Water Intelligence
├── shield.html                 # Product: Driver Safety
├── energy-monitoring.html      # Product: Energy Management
├── style.css                   # Global Design System (Typography, Grid, Colors)
├── script.js                   # GSAP Animations & Motion Logic
├── webgl.js                    # Three.js 3D Interactive Backgrounds
├── init.js                     # Early execution script (Scroll position reset)
├── server.js                   # Custom Local Node.js Server (Port 5173)
├── vercel.json                 # Production Routing & Security Headers
├── sitemap.xml                 # SEO Sitemap
├── robots.txt                  # Bot access control & AI scraper blocks
└── img/                        # High-fidelity Assets & Photography
```

---
<div align="center">
  <i>© 2026 SK Jalrakshak Innovations Pvt Ltd. All rights reserved.</i>
</div>
