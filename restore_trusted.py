import os

filepath = 'index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove recognition banner below hero section
# We'll normalize line endings to be robust
content_normalized = content.replace('\r\n', '\n')

banner_anchor = """    </section>

    <!-- ═══ RECOGNITION & INCUBATION BANNER ═══ -->
    <div class="recognition-banner" style="background: var(--bg-alt); border-bottom: 1px solid var(--border); padding: 20px 0; border-top: 1px solid var(--border); position: relative; z-index: 10;">
      <div class="wrap" style="display: flex; justify-content: center; align-items: center; gap: 32px; flex-wrap: wrap;">
        <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: var(--fg-muted);">Recognitions &amp; Incubation</span>
        <div style="display: flex; gap: 28px; align-items: center; flex-wrap: wrap; justify-content: center;">
          <span style="font-weight: 600; font-size: 0.95rem; color: var(--fg-head); display: flex; align-items: center; gap: 8px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: inline-block;"></span> Incubated at AIC IIT Delhi
          </span>
          <span style="font-weight: 600; font-size: 0.95rem; color: var(--fg-head); display: flex; align-items: center; gap: 8px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: inline-block;"></span> Startup India Recognized
          </span>
          <span style="font-weight: 600; font-size: 0.95rem; color: var(--fg-head); display: flex; align-items: center; gap: 8px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: inline-block;"></span> Make in India Initiative
          </span>
        </div>
      </div>
    </div>"""

banner_anchor_n = banner_anchor.replace('\r\n', '\n')

if banner_anchor_n in content_normalized:
    content_normalized = content_normalized.replace(banner_anchor_n, "    </section>")
    print("Removed recognition banner below hero.")
else:
    # If the style format is slightly different, let's search by string find
    start_tag = '<!-- ═══ RECOGNITION & INCUBATION BANNER ═══ -->'
    start_idx = content_normalized.find(start_tag)
    if start_idx != -1:
        # find the next </div>
        end_tag = '</div>\n\n    <!-- ═══ PLATFORM'
        end_idx = content_normalized.find(end_tag)
        if end_idx == -1:
            end_tag = '</div>\n\n    <!-- ═══'
            end_idx = content_normalized.find(end_tag)
        if end_idx != -1:
            content_normalized = content_normalized[:start_idx] + content_normalized[end_idx + 6:]
            print("Successfully removed recognition banner using indexes.")
        else:
            print("Warning: could not find end of recognition banner")
    else:
        print("Warning: could not find recognition banner start tag")

# 2. Put back animated-testi-logos block inside testimonials
testi_end_block = """        </div>


      </div>
    </section>"""

testi_end_block_n = testi_end_block.replace('\r\n', '\n')

replacement_testi = """        </div>

        <div class="animated-testi-logos gs-reveal">
          <h3 class="animated-testi-logos-title">Trusted By</h3>
          <div class="animated-testi-logos-row">
            <span style="display:inline-flex; align-items:center; gap:12px; font-weight:600;">
              <img src="img/kltif.png" alt="KL Tech Logo" style="height:48px; width:auto; object-fit:contain;">
              KL Tech
            </span>
          </div>
        </div>
      </div>
    </section>"""

replacement_testi_n = replacement_testi.replace('\r\n', '\n')

if testi_end_block_n in content_normalized:
    content_normalized = content_normalized.replace(testi_end_block_n, replacement_testi_n, 1)
    print("Restored KL Tech logo block in Testimonials.")
else:
    # Try alternate spacing
    testi_end_alternate = """        </div>
      </div>
    </section>"""
    testi_end_alternate_n = testi_end_alternate.replace('\r\n', '\n')
    if testi_end_alternate_n in content_normalized:
        content_normalized = content_normalized.replace(testi_end_alternate_n, replacement_testi_n, 1)
        print("Restored KL Tech logo block in Testimonials (alternate spacing).")
    else:
        # Let's search for FAQ block and insert before it
        faq_anchor = '<!-- ═══ FAQ ═══ -->'
        faq_idx = content_normalized.find(faq_anchor)
        if faq_idx != -1:
            # find the last </section> before faq_idx
            sec_idx = content_normalized.rfind('</section>', 0, faq_idx)
            if sec_idx != -1:
                # Find the last </div> inside the section before </section>
                div_idx = content_normalized.rfind('</div>', 0, sec_idx)
                if div_idx != -1:
                    # We can insert before that closing </div>
                    content_normalized = content_normalized[:div_idx] + "\n        <div class=\"animated-testi-logos gs-reveal\">\n          <h3 class=\"animated-testi-logos-title\">Trusted By</h3>\n          <div class=\"animated-testi-logos-row\">\n            <span style=\"display:inline-flex; align-items:center; gap:12px; font-weight:600;\">\n              <img src=\"img/kltif.png\" alt=\"KL Tech Logo\" style=\"height:48px; width:auto; object-fit:contain;\">\n              KL Tech\n            </span>\n          </div>\n        </div>\n      " + content_normalized[div_idx:]
                    print("Restored KL Tech logo block in Testimonials using index calculations.")
                else:
                    print("Error: Could not find closing div inside testimonials section")
                    exit(1)
            else:
                print("Error: Could not find section closing before FAQ anchor")
                exit(1)
        else:
            print("Error: FAQ anchor not found")
            exit(1)

content = content_normalized.replace('\n', '\r\n')

with open(filepath, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("Restoration complete!")
