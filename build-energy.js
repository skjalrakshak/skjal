const fs = require('fs');

let content = fs.readFileSync('energy-monitoring.html', 'utf8');

// Title and Meta
content = content.replace(/<title>S\.H\.I\.E\.L\.D\..*?<\/title>/, '<title>Energy Monitoring | SK Jalrakshak Innovations</title>');
content = content.replace(/<meta name="description".*?>/, '<meta name="description" content="Energy Monitoring: Smart Monitoring for Smarter Energy Decisions. Detailed insights into energy consumption patterns across your facility.">');

// Hero Section
content = content.replace(/<img src="https:\/\/images\.unsplash\.com.*?">/, '<img src="img/energy-monitoring.jpeg" alt="Energy Monitoring">');
content = content.replace(/<span class="product-hero-badge">PATENT GRANTED<\/span>/, '<span class="product-hero-badge" style="background:#10b981;">NEW PRODUCT</span>');
content = content.replace(/<h1 class="product-hero-title">S\.H\.I\.E\.L\.D\.<\/h1>/, '<h1 class="product-hero-title">Energy Monitoring</h1>');
content = content.replace(/<p class="product-hero-sub">.*?<\/p>/s, '<p class="product-hero-sub">Smart Monitoring for Smarter Energy Decisions. Our Energy Meter Monitoring solution offers detailed insights into energy consumption patterns across your facility. By identifying inefficiencies and optimizing usage, you can significantly reduce energy costs and enhance sustainability.</p>');

// Challenge & Solution -> Replace with "Applications"
const applicationsHTML = `
  <section class="product-section">
    <div class="wrap">
      <p class="sec-eyebrow" style="color:#10b981;">Applications</p>
      <h2 class="sec-title">Where It's Used</h2>
      <p class="body-text" style="margin-bottom: 12px;">Detailed Monitoring energy use to optimize production processesing in IOT Is a Crucial Process.</p>
      <div class="target-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="target-item">
          <div class="target-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <h4>Manufacturing Plants</h4>
          <p style="font-size: 0.85rem; margin-top:10px; color:var(--fg-body);">Detailed Monitoring energy use to optimize production processesing in IOT Is a Crucial Process</p>
        </div>
        <div class="target-item">
          <div class="target-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
          </div>
          <h4>Office Buildings</h4>
          <p style="font-size: 0.85rem; margin-top:10px; color:var(--fg-body);">Identifying and reducing energy waste in HVAC and lighting systems</p>
        </div>
        <div class="target-item">
          <div class="target-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
          </div>
          <h4>Data Centers</h4>
          <p style="font-size: 0.85rem; margin-top:10px; color:var(--fg-body);">Tracking energy consumption to manage cooling systems efficiently</p>
        </div>
      </div>
    </div>
  </section>
`;
content = content.replace(/<section class="product-section">[\s\S]*?<!-- Core Technology -->/, applicationsHTML + '\n\n  <!-- Core Technology -->');

// Core Technology -> Replace with "Features & Benefits"
const featuresHTML = `
  <section class="product-section" style="background: var(--bg-alt);">
    <div class="wrap">
      <p class="sec-eyebrow" style="color:#10b981;">Features</p>
      <h2 class="sec-title">Key Benefits</h2>
      <div class="product-features-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="product-feature-card">
          <div class="product-feature-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3>Reduce Energy Costs</h3>
          <p>Optimize energy usage to lower operational expenses.</p>
        </div>
        <div class="product-feature-card">
          <div class="product-feature-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <h3>Promote Sustainability</h3>
          <p>Support green initiatives by reducing energy waste.</p>
        </div>
        <div class="product-feature-card">
          <div class="product-feature-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h3>Improve Efficiency</h3>
          <p>Identify and address areas of high energy consumption.</p>
        </div>
        <div class="product-feature-card">
          <div class="product-feature-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3>Extended Life</h3>
          <p>Keep machines running smoothly and prolong their operational lifespan.</p>
        </div>
        <div class="product-feature-card">
          <div class="product-feature-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <h3>Budget Forecasting</h3>
          <p>Provide accurate data to assist in better energy budgeting and financial planning.</p>
        </div>
        <div class="product-feature-card">
          <div class="product-feature-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <h3>Compliance & Reporting</h3>
          <p>Ensure compliance with energy regulations and generate detailed reports for audits and certifications.</p>
        </div>
      </div>
    </div>
  </section>
`;
content = content.replace(/<!-- Core Technology -->[\s\S]*?<!-- Target Market -->/, '<!-- Features -->\n' + featuresHTML + '\n\n  <!-- Target Market -->');

// Remove Target Market and Status Sections completely (since we combined them)
content = content.replace(/<!-- Target Market -->[\s\S]*?<!-- CTA -->/, '<!-- CTA -->');

// Change brand colors from orange to green (#10b981) for the CTA and other small things
content = content.replace(/#FF5500/g, '#10b981');

fs.writeFileSync('energy-monitoring.html', content);
console.log('energy-monitoring.html built successfully');
