import glob
import re

new_footer = """    <footer id="footer">
      <div class="wrap" style="max-width: 1200px; padding: 0 20px; position: relative; z-index: 1;">
        <div class="foot-grid">
          <!-- Brand -->
          <div class="foot-brand-col">
            <img src="img/make-in-india-transparent.webp" alt="Make in India" class="foot-mii-img" loading="lazy" decoding="async" />
            <div class="foot-brand-details">
              <div><strong>SK Jalrakshak:</strong> Proudly Make in India</div>
              <div class="foot-brand-list">
                <div><strong>CIN:</strong> U26517AP2025PTC119413</div>
                <div><strong>GSTIN:</strong> </div>
                <div><strong>D-U-N-S:</strong> </div>
                <div><strong>Startup India Recognized</strong></div>
              </div>
            </div>
          </div>
          <!-- Products -->
          <div class="foot-col">
            <h4 class="foot-col-title">Our Products</h4>
            <ul class="foot-links">
              <li><a href="jal-rakshak.html"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Jal Rakshak</a></li>
              <li><a href="shield.html"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> S.H.I.E.L.D.</a></li>
              <li><a href="energy-monitoring.html"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Energy Monitoring</a></li>
            </ul>
          </div>
          <!-- Quick Links -->
          <div class="foot-col">
            <h4 class="foot-col-title">Quick Links</h4>
            <ul class="foot-links">
              <li><a href="index.html"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Home</a></li>
              <li><a href="about.html"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> About Us</a></li>
              <li><a href="contact.html"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Careers</a></li>
            </ul>
          </div>
          <!-- Contact -->
          <div class="foot-col">
            <h4 class="foot-col-title">Contact Us</h4>
            <ul class="foot-links">
              <li><a href="tel:+918978859246"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> +91 89788 59246</a></li>
              <li><a href="mailto:sales@skjal.in"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> sales@skjal.in</a></li>
              <li><a href="https://maps.google.com/?q=Innovation+Valley+Visakhapatnam" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Innovation Valley, Visakhapatnam</a></li>
              <li><a href="https://www.linkedin.com/company/sk-jalrakshak-innovations-pvt-ltd/" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom">
          <span class="foot-copy">&copy; 2026 SK Jalrakshak Innovations Pvt Ltd. All rights reserved.</span>
          <div class="foot-legal">
            <a href="privacy.html">Privacy Policy</a>
            <a href="#" class="foot-back-top" onclick="window.scrollTo({top:0, behavior:'smooth'}); return false;">&uarr; Top</a>
          </div>
        </div>
      </div>
    </footer>"""

html_files = glob.glob('*.html')

for file in html_files:
    if file == 'old_index.html':
        continue
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Try <footer id="footer"> first
    pattern1 = re.compile(r'<footer id="footer">.*?</footer>', re.DOTALL)
    if pattern1.search(html):
        new_html = pattern1.sub(new_footer, html)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Updated footer (id) in {file}")
        continue
        
    # Try generic <footer>
    pattern2 = re.compile(r'<footer>.*?</footer>', re.DOTALL)
    if pattern2.search(html):
        new_html = pattern2.sub(new_footer, html)
        
        # We need to make sure style.css is linked in these SEO pages so the footer renders correctly.
        if 'style.css' not in new_html:
            new_html = new_html.replace('</head>', '    <link rel="stylesheet" href="assets/css/style.css">\n</head>')

        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Updated footer (generic) in {file}")
    else:
        print(f"Footer not found in {file}")
