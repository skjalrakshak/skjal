import os
import glob
import re

html_files = glob.glob('*.html')

barba_script = '<script defer="defer" src="https://cdn.jsdelivr.net/npm/@barba/core@2.9.7/dist/barba.umd.js"></script>'
barba_script_alt = '<script defer src="https://cdn.jsdelivr.net/npm/@barba/core@2.9.7/dist/barba.umd.js"></script>'

for file_path in html_files:
    if file_path == '404.html':
        continue # Already completely rewritten manually
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove Barba.js
    content = content.replace(barba_script, '')
    content = content.replace(barba_script_alt, '')

    # 2. Extract charset and viewport
    charset_match = re.search(r'<meta charset="[^"]*"\s*/?>', content)
    viewport_match = re.search(r'<meta name="viewport" content="[^"]*"\s*/?>', content)
    
    charset_str = charset_match.group(0) if charset_match else '<meta charset="UTF-8" />'
    viewport_str = viewport_match.group(0) if viewport_match else '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
    
    if charset_match:
        content = content.replace(charset_match.group(0), '')
    if viewport_match:
        content = content.replace(viewport_match.group(0), '')
        
    # 3. Add them immediately after <head>
    head_start = '<head>'
    if head_start in content:
        insert_idx = content.find(head_start) + len(head_start)
        insertion = f'\n    {charset_str}\n    {viewport_str}'
        content = content[:insert_idx] + insertion + content[insert_idx:]

    # 4. Add theme-color if missing
    if '<meta name="theme-color"' not in content and '</head>' in content:
        head_end_idx = content.find('</head>')
        content = content[:head_end_idx] + '    <meta name="theme-color" content="#ffffff" />\n  ' + content[head_end_idx:]

    # 5. Clean up massive empty lines
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)

    # 6. Specific fix for index.html: remove the massive inline <style> block
    if file_path == 'index.html':
        # Find the massive style block (starts around line 193)
        # It's the only <style> block that contains 'html.lenis'
        style_match = re.search(r'<style>[\s\S]*?html\.lenis[\s\S]*?</style>', content)
        if style_match:
            content = content.replace(style_match.group(0), '')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Processed {len(html_files)} HTML files.")
