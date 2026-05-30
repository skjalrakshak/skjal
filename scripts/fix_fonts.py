import glob
import re
import os

print("Updating style.css...")
css_path = os.path.join('assets', 'css', 'style.css')
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
    
    css = re.sub(r"--sans:\s*['\"]Montserrat['\"][^;]*;", '--sans: "Plus Jakarta Sans", "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;', css)
    css = re.sub(r"--display:\s*['\"]Playfair Display['\"][^;]*;", '--display: var(--sans);', css)
    
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)

print("Updating HTML files...")
files = glob.glob('*.html')
for file in files:
    if file == 'old_index.html': continue
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(file, 'r', encoding='utf-16') as f:
                content = f.read()
        except:
            print(f"Skipping {file} due to encoding issue")
            continue
            
    original = content
    
    # 1. Remove noscript font imports
    content = re.sub(r'<noscript[^>]*>\s*<link[^>]*Montserrat[^>]*>\s*</noscript>', '', content, flags=re.DOTALL|re.IGNORECASE)
    
    # 2. Replace old Google font links with Plus Jakarta Sans
    link_pattern_multiline = r'<link[^>]*href="https://fonts\.googleapis\.com/css2\?family=[^"]*"[^>]*>'
    new_link = '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />'
    
    content = re.sub(link_pattern_multiline, new_link, content, flags=re.IGNORECASE)

    # Clean up duplicate Plus Jakarta Sans links
    while content.count(new_link) > 1:
        content = content.replace(new_link, '', 1)

    # 3. Update inline <style> CSS variables if they exist
    content = re.sub(r"--sans:\s*['\"]?(?:Montserrat|Plus Jakarta Sans)['\"]?[^;]*;", '--sans: "Plus Jakarta Sans", "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;', content)
    content = re.sub(r"--display:\s*['\"]Playfair Display['\"][^;]*;", '--display: var(--sans);', content)
    
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file}")

print("Done!")
