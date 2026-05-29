import os
import re

def update_navbar_and_footer(html):
    # Update Home links
    html = re.sub(r'href="#hero"', 'href="index.html"', html)
    
    # Desktop About Us
    about_desktop = '''<div class="nav-dropdown">
          <button class="nav-link nav-dropdown-trigger">About Us <svg class="nav-chevron" width="10" height="10"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg></button>
          <div class="nav-dropdown-menu">
            <a href="#about" class="nav-dropdown-item">About</a>
            <a href="#about" class="nav-dropdown-item">Directors</a>
            <a href="#contact" class="nav-dropdown-item">Careers</a>
          </div>
        </div>'''
    
    # Handle both formatted and unformatted variations by matching structure with regex properly
    about_pattern = r'<div class="nav-dropdown">\s*<button class="nav-link nav-dropdown-trigger[^>]*">\s*About Us[\s\S]*?</svg>\s*</button>\s*<div class="nav-dropdown-menu">[\s\S]*?</div>\s*</div>'
    html = re.sub(about_pattern, '<a href="about.html" class="nav-link">About Us</a>', html)
    
    # Desktop Resources
    resources_pattern = r'<div class="nav-dropdown">\s*<button class="nav-link nav-dropdown-trigger[^>]*">\s*Resources[\s\S]*?</svg>\s*</button>\s*<div class="nav-dropdown-menu">[\s\S]*?</div>\s*</div>'
    html = re.sub(resources_pattern, '<a href="resources.html" class="nav-link">Resources</a>', html)

    # Mobile Drawer About Us
    mobile_about_pattern = r'<div class="nav-drawer-group">\s*<button class="nav-drawer-link nav-drawer-trigger[^>]*">\s*About Us[\s\S]*?</svg>\s*</button>\s*<div class="nav-drawer-sub">[\s\S]*?</div>\s*</div>'
    html = re.sub(mobile_about_pattern, '<a href="about.html" class="nav-drawer-link">About Us</a>', html)
    
    # Mobile Drawer Resources
    mobile_resources_pattern = r'<div class="nav-drawer-group">\s*<button class="nav-drawer-link nav-drawer-trigger[^>]*">\s*Resources[\s\S]*?</svg>\s*</button>\s*<div class="nav-drawer-sub">[\s\S]*?</div>\s*</div>'
    html = re.sub(mobile_resources_pattern, '<a href="resources.html" class="nav-drawer-link">Resources</a>', html)

    # Update Contact Us link
    html = re.sub(r'href="#contact"', 'href="contact.html"', html)
    html = re.sub(r'href="index.html#contact"', 'href="contact.html"', html)

    # Other #innovations / #faq links in drawer/dropdowns
    html = re.sub(r'href="#innovations"', 'href="resources.html"', html)
    html = re.sub(r'href="#faq"', 'href="resources.html#faq"', html)
    html = re.sub(r'href="index.html#innovations"', 'href="resources.html"', html)
    html = re.sub(r'href="index.html#faq"', 'href="resources.html#faq"', html)
    html = re.sub(r'href="index.html#about"', 'href="about.html"', html)
    
    return html

def get_section(html, section_id):
    pattern = rf'(<section\s+(?:class="[^"]*"\s+)?id="{section_id}".*?</section>)'
    match = re.search(pattern, html, flags=re.DOTALL)
    if not match:
        pattern2 = rf'(<section\s+id="{section_id}".*?</section>)'
        match = re.search(pattern2, html, flags=re.DOTALL)
    return match.group(1) if match else ""

with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

main_start = index_html.find('<main')
main_end = index_html.find('</main>') + len('</main>')

pre_main = index_html[:main_start]
post_main = index_html[main_end:]

about_section = get_section(index_html, 'about')
innovations_section = get_section(index_html, 'innovations')
faq_section = get_section(index_html, 'faq')
contact_section = get_section(index_html, 'contact')

about_html = pre_main + '<main>\n' + about_section + '\n</main>' + post_main
about_html = update_navbar_and_footer(about_html)
with open('about.html', 'w', encoding='utf-8') as f:
    f.write(about_html)

resources_html = pre_main + '<main>\n' + innovations_section + '\n' + faq_section + '\n</main>' + post_main
resources_html = update_navbar_and_footer(resources_html)
with open('resources.html', 'w', encoding='utf-8') as f:
    f.write(resources_html)

contact_html = pre_main + '<main>\n' + contact_section + '\n</main>' + post_main
contact_html = update_navbar_and_footer(contact_html)
with open('contact.html', 'w', encoding='utf-8') as f:
    f.write(contact_html)

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f not in ['about.html', 'resources.html', 'contact.html']]
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = update_navbar_and_footer(content)
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated nav links in {file}")
