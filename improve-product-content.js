const fs = require('fs');

function updateProductHero(file, newTitle, newSub) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  // Replace subtext for jal-rakshak and shield
  const subRegex = /<p class="product-hero-sub">[\s\S]*?<\/p>/;
  html = html.replace(subRegex, '<p class="product-hero-sub">' + newSub + '</p>');

  fs.writeFileSync(file, html);
  console.log('Upgraded content in ' + file);
}

// Jal Rakshak
updateProductHero(
  'jal-rakshak.html',
  'Jal Rakshak',
  'Our flagship AI-driven water intelligence platform. We deploy advanced IoT sensors to monitor water quality, detect leaks, and optimize usage in real-time. Gain complete operational control and protect every drop with predictive cloud analytics.'
);

// Shield
updateProductHero(
  'shield.html',
  'S.H.I.E.L.D.',
  'Smart Health Intelligence for Ergonomic & Live Driving. An AI-powered hardware ecosystem that continuously tracks vibration exposure, speed, and driver health. We deliver real-time, personalized safety protocols to commercial and two-wheeler drivers across India.'
);
