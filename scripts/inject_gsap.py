import re
import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add classes to background elements for easy selection
html = re.sub(r'(<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background:\s*radial-gradient)', r'<div class="hero-bg-el" style="position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: radial-gradient', html)

html = re.sub(r'(<svg style="position: absolute; bottom: 0; left: 0; width: 100%; height: auto; z-index: 0; opacity: 0\.8;\s*pointer-events: none;" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">)', r'<svg class="hero-bg-el hero-bg-svg" style="position: absolute; bottom: 0; left: 0; width: 100%; height: auto; z-index: 0; opacity: 0.8; pointer-events: none;" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">', html)

# 2. Add class to divider
html = html.replace('<div style="width: 28px; height: 2px; background-color: #ef4444; margin-bottom: 20px;"></div>', '<div class="hero-divider" style="width: 28px; height: 2px; background-color: #ef4444; margin-bottom: 20px;"></div>')

# 3. Add Pre-Animation CSS to <head>
css = """
    <!-- GSAP Hero Animation Pre-States -->
    <style id="hero-anim-css">
      .hero-bg-el { opacity: 0; }
      .hero-tag { opacity: 0; transform: translateY(-20px); }
      .hero-line-wrap { overflow: hidden; display: block; }
      .hero-line { display: block; transform: translateY(100%); opacity: 0; }
      .hero-divider { transform: scaleX(0); transform-origin: center; opacity: 0; }
      .hero-bottom { opacity: 0; transform: translateY(20px); }
    </style>
"""
if "hero-anim-css" not in html:
    html = html.replace('</head>', f'{css}</head>')

# 4. Add GSAP and logic to bottom of <body>
js = """
    <!-- GSAP Core -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        // Highly Cinematic Hero Entrance Timeline
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Backgrounds fade in slowly
        tl.to(".hero-bg-el:not(.hero-bg-svg)", { opacity: 1, duration: 2.5 }, 0.2)
          .to(".hero-bg-svg", { opacity: 0.8, duration: 2.5 }, 0.2);

        // 2. Tagline fades and slides down
        tl.to(".hero-tag", { opacity: 1, y: 0, duration: 1.2 }, 0.5);

        // 3. Cinematic Text Reveal (Staggered lines up)
        tl.to(".hero-line", {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power4.out"
        }, 0.7);

        // 4. Divider Line draws out from center
        tl.to(".hero-divider", {
          opacity: 1,
          scaleX: 1,
          duration: 1,
          ease: "expo.out"
        }, 1.2);

        // 5. Sub-headline and Action Button float up
        tl.to(".hero-bottom", {
          opacity: 1,
          y: 0,
          duration: 1.2,
        }, 1.4);
      });
    </script>
"""
if "gsap.min.js" not in html:
    html = html.replace('</body>', f'{js}</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
    
print("Successfully injected GSAP cinematic animation.")
