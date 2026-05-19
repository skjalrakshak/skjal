const fs = require('fs');

let html = fs.readFileSync('energy-monitoring.html', 'utf8');

// The original padding was 160px, making it pushed down too far.
// We'll change it to 100px to move the image and matter upward.
html = html.replace('padding: 160px 5% 100px;', 'padding: 110px 5% 60px;');

// Also fix mobile padding while we are here
html = html.replace('padding: 140px 5% 60px;', 'padding: 90px 5% 40px;');

// Make sure it aligns to the top of the container instead of center if it's too squished?
// Actually align-items: center is good, but if they want it higher, align-items: start might be too rigid.
// Reducing the padding will bring the whole block up immediately.
html = html.replace('align-items: center;', 'align-items: flex-start;');

fs.writeFileSync('energy-monitoring.html', html);
console.log('Hero padding updated to shift content upward');
