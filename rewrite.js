const fs = require('fs');

const cssLink = '<link rel="stylesheet" href="assets/css/cinematic.css">';
const jsLink = '<script defer src="assets/js/cinematic.js"></script>';

function processFile(filename, img1, img2, title1, desc1, title2, desc2) {
    let content = fs.readFileSync(filename, 'utf8');

    // Insert CSS and JS
    if (!content.includes('cinematic.css')) {
        content = content.replace('</head>', `${cssLink}\n</head>`);
    }
    if (!content.includes('cinematic.js')) {
        content = content.replace('</body>', `${jsLink}\n</body>`);
    }

    // Find where the hero section ends
    const heroEndMatch = content.match(/<\/section><section class="product-section/);
    const footerMatch = content.match(/<footer id="footer"/);

    if (heroEndMatch && footerMatch) {
        const heroEndIndex = heroEndMatch.index + 10; // keep </section>
        const footerIndex = footerMatch.index;

        const cinematicHtml = `
<section class="cinematic-scroll bg-alt">
    <div class="cinematic-sticky">
        <img id="cinematicImage" src="${img1}" alt="Cinematic View">
    </div>
    <div class="cinematic-content">
        <div class="cinematic-block" data-image="${img1}">
            <h2>${title1}</h2>
            <p>${desc1}</p>
            <div class="cinematic-stat">99.9%<span>Accuracy</span></div>
        </div>
        <div class="cinematic-block" data-image="${img2}">
            <h2>${title2}</h2>
            <p>${desc2}</p>
            <div class="cinematic-stat">24/7<span>Monitoring</span></div>
        </div>
    </div>
</section>
`;
        content = content.substring(0, heroEndIndex) + cinematicHtml + content.substring(footerIndex);
        fs.writeFileSync(filename, content, 'utf8');
        console.log(`Processed ${filename}`);
    } else {
        console.log(`Could not find sections in ${filename}`);
    }
}

// 1. Jal Rakshak
processFile(
    'jal-rakshak.html',
    'img/jal_rakshak_sensor.png',
    'img/jal_rakshak_dash.png',
    'Autonomous Water Grid',
    'Our rugged IoT edge sensors operate seamlessly near rivers and treatment plants. Experience uninterrupted data flow with military-grade reliability and depth-sensing AI.',
    'Intelligent Telemetry',
    'Real-time visualization on our dark-mode glassmorphic dashboards. Track pH, turbidity, and anomalies instantly before they escalate into crises.'
);

// 2. Shield
processFile(
    'shield.html',
    'img/shield_dashcam.png',
    'img/shield_fleet.png',
    'AI Dashcam Vision',
    'Mount the SHIELD AI optical lens in your heavy logistics cabins. It actively monitors driver fatigue and distraction using predictive spatial tracking.',
    'Fleet Command Center',
    'An ultra-premium dashboard for logistics managers. Predict maintenance, optimize routes, and enforce safety protocols across thousands of vehicles effortlessly.'
);

// 3. Energy
processFile(
    'energy-monitoring.html',
    'img/energy_node.png',
    'img/energy_dash.png',
    'Industrial Telemetry Node',
    'Connected directly to heavy electrical panels, our IoT nodes detect voltage spikes and power factor drops instantly across massive factory floors.',
    'Predictive Energy Dash',
    'A high-tech monitoring suite that visualizes your entire power grid. Reduce costs and prevent outages with our AI-powered energy analytics.'
);
