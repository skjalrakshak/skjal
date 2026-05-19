const fs = require('fs');

const files = ['jala-rakshak.html', 'shield.html', 'energy-monitoring.html'];

const smoothScrollSnippet = `
  <script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
  <script>
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true, 
      mouseMultiplier: 0.7,
      smoothTouch: false, 
      touchMultiplier: 2,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  </script>
</body>`;

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it already has lenis
    if (!content.includes('lenis.min.js')) {
      content = content.replace('</body>', smoothScrollSnippet);
      fs.writeFileSync(file, content);
      console.log('Added smooth scrolling to ' + file);
    } else {
      console.log(file + ' already has smooth scrolling');
    }
  }
});
