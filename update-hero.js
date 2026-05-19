const fs = require('fs');

let content = fs.readFileSync('energy-monitoring.html', 'utf8');

// Replace the old hero CSS
const oldCSS = `.product-hero {
      min-height: 70vh;
      display: flex;
      align-items: center;
      padding: 120px 32px 80px;
      position: relative;
      overflow: hidden;
    }
    .product-hero-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .product-hero-bg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.4);
    }
    .product-hero-content {
      position: relative;
      z-index: 2;
      max-width: 720px;
      color: #ffffff;
    }
    .product-hero-badge {
      display: inline-block;
      padding: 6px 16px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #ffffff;
      background: #10b981;
      border-radius: 100px;
      margin-bottom: 24px;
    }
    .product-hero-title {
      font-family: var(--display);
      font-size: clamp(2.8rem, 6vw, 5rem);
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.04em;
      margin-bottom: 20px;
    }
    .product-hero-sub {
      font-size: 1.15rem;
      line-height: 1.7;
      opacity: 0.85;
      max-width: 560px;
      margin-bottom: 32px;
    }
    .product-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #ffffff;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 100px;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .product-back:hover {
      background: rgba(255,255,255,0.2);
      transform: translateX(-4px);
    }`;

const newCSS = `.energy-split-hero {
      padding: 160px 5% 100px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }
    @media (max-width: 968px) {
      .energy-split-hero {
        grid-template-columns: 1fr;
        padding: 140px 5% 60px;
        gap: 40px;
      }
    }
    .energy-hero-img-wrap {
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 24px 48px rgba(0,0,0,0.12);
      border: 1px solid var(--border);
    }
    .energy-hero-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .energy-hero-eyebrow {
      color: #0070f3;
      font-weight: 700;
      font-size: 1.2rem;
      margin-bottom: 16px;
      font-family: var(--display);
    }
    .energy-hero-title {
      font-family: var(--display);
      font-size: clamp(2.5rem, 4.5vw, 4.5rem);
      font-weight: 800;
      line-height: 1.1;
      color: var(--fg-head);
      margin-bottom: 24px;
      letter-spacing: -0.03em;
    }
    .energy-hero-desc {
      font-size: 1.15rem;
      line-height: 1.7;
      color: var(--fg-body);
      margin-bottom: 40px;
      max-width: 540px;
    }
    .energy-form-group {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      max-width: 500px;
    }
    @media (max-width: 500px) {
      .energy-form-group { flex-direction: column; }
    }
    .energy-input {
      flex: 1;
      padding: 16px 20px;
      border: 1px solid var(--border);
      background: var(--bg-alt);
      border-radius: 8px;
      font-family: inherit;
      font-size: 1rem;
      color: var(--fg-head);
      transition: all 0.3s;
    }
    .energy-input:focus {
      outline: none;
      border-color: #0070f3;
      box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
    }
    .energy-submit {
      padding: 16px 32px;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }
    .energy-submit:hover {
      background: #005bb5;
      transform: translateY(-2px);
    }`;

// Replace the CSS
if (content.includes(oldCSS.substring(0, 100))) {
  // Use regex to replace everything from .product-hero to .product-back:hover { ... }
  content = content.replace(/\.product-hero \{[\s\S]*?\.product-back:hover \{[\s\S]*?\}/, newCSS);
} else {
  console.log('Failed to match old CSS exactly');
  // Fallback: just append the new CSS before </style>
  content = content.replace('</style>', newCSS + '\n  </style>');
}

// Remove the old media query that was left behind
content = content.replace(/@media \(max-width: 900px\) \{\s*\.product-features-grid \{ grid-template-columns: 1fr; \}\s*\.product-hero \{ padding: 100px 20px 60px; min-height: 50vh; \}\s*\}/, '@media (max-width: 900px) {\n      .product-features-grid { grid-template-columns: 1fr; }\n    }');


// Replace the old HTML section
const oldHTMLRegex = /<section class="product-hero">[\s\S]*?<\/section>/;

const newHTML = `
  <section class="energy-split-hero">
    <div class="energy-hero-img-wrap gs-reveal">
      <img src="img/energy-monitoring.jpeg" alt="Energy Monitoring Panel">
    </div>
    <div class="energy-hero-content gs-reveal">
      <div class="energy-hero-eyebrow">Energy Meter Monitoring</div>
      <h1 class="energy-hero-title">Smart Monitoring for Smarter Energy Decisions</h1>
      <p class="energy-hero-desc">Our Energy Meter Monitoring solution offers detailed insights into energy consumption patterns across your facility. By identifying inefficiencies and optimizing usage, you can significantly reduce energy costs and enhance sustainability.</p>
      <form class="energy-form-group" onsubmit="event.preventDefault(); alert('Thank you! The case study will be sent to your email.');">
        <input type="email" class="energy-input" placeholder="Enter your Email To Download Case Study PDF" required>
        <button type="submit" class="energy-submit">Submit</button>
      </form>
      <a href="index.html" style="display:inline-flex; align-items:center; gap:8px; font-weight:600; color:var(--fg-body); text-decoration:none; font-size:0.9rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Home
      </a>
    </div>
  </section>`;

content = content.replace(oldHTMLRegex, newHTML);

fs.writeFileSync('energy-monitoring.html', content);
console.log('Hero replaced successfully');
