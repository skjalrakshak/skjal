const fs = require('fs');
fs.appendFileSync('assets/js/script.js', `

// DYNAMIC WEBGL ENGINE LAZY LOAD
(function initWebGL() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const loadWebGL = () => {
    if (!document.getElementById('webgl-canvas')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/webgl.js';
    script.defer = true;
    document.body.appendChild(script);
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadWebGL, { timeout: 2000 });
  } else {
    setTimeout(loadWebGL, 500);
  }
})();
`);
