import glob
import re
import os

files = glob.glob('*.html')
for file in files:
    if file == 'old_index.html': continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Remove contact us button from top right
    content = re.sub(r'<a[^>]*?class="nav-cta-btn"[^>]*>.*?</a>', '', content, flags=re.DOTALL)
    
    # 2. Add FAQ to nav-menu
    def add_faq(match):
        menu_html = match.group(0)
        if 'FAQ' not in menu_html:
            menu_html = menu_html.replace('</nav>', ' <a href="index.html#faq" class="nav-link">FAQ</a>\n</nav>')
        return menu_html
    content = re.sub(r'<nav class="nav-menu"[^>]*>.*?</nav>', add_faq, content, flags=re.DOTALL)
    
    # 3. Add FAQ to mobile drawer
    def add_faq_drawer(match):
        menu_html = match.group(0)
        if 'FAQ' not in menu_html:
            menu_html = menu_html.replace('</nav>', ' <a href="index.html#faq" class="nav-drawer-link">FAQ</a>\n</nav>')
        return menu_html
    content = re.sub(r'<nav class="nav-drawer-links"[^>]*>.*?</nav>', add_faq_drawer, content, flags=re.DOTALL)
    
    # 4. Move nav-menu out of nav-left
    # We find the nav-left div, the nav-logo a tag, the nav-menu, and the closing div of nav-left.
    pattern = r'(<a[^>]*?class="nav-logo"[^>]*>.*?</a>)\s*(<nav class="nav-menu".*?</nav>)\s*</div>'
    def move_nav(match):
        logo_html = match.group(1)
        menu_html = match.group(2)
        # return logo closed by div, then menu
        return f'{logo_html}\n</div>\n{menu_html}'
    
    content = re.sub(pattern, move_nav, content, flags=re.DOTALL)
    
    if content != original_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file}")
