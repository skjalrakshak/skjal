import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

js = """
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        if(typeof gsap === 'undefined') {
            console.warn("GSAP is not loaded.");
            return;
        }
        
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

# Add the script before </body>
if "Highly Cinematic Hero Entrance Timeline" not in html:
    html = re.sub(r'</body>', f'{js}</body>', html, flags=re.IGNORECASE)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Successfully injected GSAP cinematic animation script.")
else:
    print("Script already injected.")
