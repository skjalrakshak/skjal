import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

preloader_html_pattern = r'<!-- ═══ PRELOADER \(Intro Scene\) ═══ -->\s*<div id="preloader">.*?</div>\s*<!-- ═══ PAGE TRANSITION OVERLAY ═══ -->'
failsafe_pattern = r'<!-- Failsafe: if preloader is still visible after 6 seconds, fade it out and reveal hero content -->\s*<script>.*?</script>'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will use re.sub with DOTALL to remove the preloader block
    # Note: Because <div id="preloader"> contains nested divs, regex might fail if we just do .*?</div>.
    # But since it ends right before <!-- ═══ PAGE TRANSITION OVERLAY ═══ -->, we can use that!
    
    new_content = re.sub(preloader_html_pattern, '<!-- ═══ PAGE TRANSITION OVERLAY ═══ -->', content, flags=re.DOTALL)
    new_content = re.sub(failsafe_pattern, '', new_content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed preloader from {file}")
