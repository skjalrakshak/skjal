const fs = require('fs');

// 1. Upgrade style.css typography
let css = fs.readFileSync('style.css', 'utf8');

// Upgrade body text readability
if (css.includes('body {') && css.includes('font-family: var(--body);')) {
  css = css.replace(/body\s*\{[\s\S]*?\}/, (match) => {
    return match
      .replace(/font-size:[^;]+;/, 'font-size: 1.125rem;')
      .replace(/line-height:[^;]+;/, 'line-height: 1.8;')
      .replace(/color: var\(--fg-body\);/, 'color: var(--fg-body);\n  letter-spacing: 0.015em;');
  });
}

// Upgrade headings
css = css.replace(/h1, h2, h3, h4, h5, h6\s*\{[\s\S]*?\}/, (match) => {
  return match
    .replace(/line-height:[^;]+;/, 'line-height: 1.15;')
    .replace(/color: var\(--fg-head\);/, 'color: var(--fg-head);\n  letter-spacing: -0.02em;');
});

fs.writeFileSync('style.css', css);
console.log('Typography upgraded in style.css');

// 2. Improve content in index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Replace Hero Section
const oldHeroTitleRegex = /<h1 class="hero-title[^>]*>[\s\S]*?<\/h1>/;
const oldHeroDescRegex = /<p class="hero-desc[^>]*>[\s\S]*?<\/p>/;

indexHtml = indexHtml.replace(oldHeroTitleRegex, '<h1 class="hero-title gs-reveal" style="font-size: clamp(3rem, 6vw, 6rem); max-width: 900px; margin: 0 auto 24px;">Intelligence for Critical Resources</h1>');
indexHtml = indexHtml.replace(oldHeroDescRegex, '<p class="hero-desc gs-reveal" style="font-size: 1.25rem; max-width: 750px; margin: 0 auto 40px;">We engineer advanced AI & IoT platforms that optimize energy consumption, protect water infrastructure, and ensure human safety in real-time. Transforming complex industrial operations into clear, actionable ecosystems.</p>');

// Replace "Our Products" Intro
const oldSecTitleRegex = /<h2 class="sec-title gs-reveal">The Next Generation of Intelligence<\/h2>/;
const oldBodyTextRegex = /<p class="body-text gs-reveal">We engineer advanced IoT hardware and proprietary AI algorithms to solve the most critical challenges in infrastructure and safety\.<\/p>/;

if (indexHtml.match(oldSecTitleRegex)) {
  indexHtml = indexHtml.replace(oldSecTitleRegex, '<h2 class="sec-title gs-reveal">What We Do</h2>');
} else {
  // general fallback if exact match fails
  indexHtml = indexHtml.replace(/<h2 class="sec-title gs-reveal">.*?<\/h2>/, '<h2 class="sec-title gs-reveal">What We Do</h2>');
}

if (indexHtml.match(oldBodyTextRegex)) {
  indexHtml = indexHtml.replace(oldBodyTextRegex, '<p class="body-text gs-reveal">Our enterprise solutions provide unprecedented visibility into your operations. We track, analyze, and optimize your vital resources so you can make confident, data-driven decisions.</p>');
} else {
  indexHtml = indexHtml.replace(/<p class="body-text gs-reveal">We engineer advanced IoT hardware.*?<\/p>/, '<p class="body-text gs-reveal">Our enterprise solutions provide unprecedented visibility into your operations. We track, analyze, and optimize your vital resources so you can make confident, data-driven decisions.</p>');
}

fs.writeFileSync('index.html', indexHtml);
console.log('Content upgraded in index.html');
