import os
import re

file_path = 'about.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

barba_script = '<script defer="defer" src="https://cdn.jsdelivr.net/npm/@barba/core@2.9.7/dist/barba.umd.js"></script>'
barba_script_alt = '<script defer src="https://cdn.jsdelivr.net/npm/@barba/core@2.9.7/dist/barba.umd.js"></script>'

content = content.replace(barba_script, '')
content = content.replace(barba_script_alt, '')

charset_match = re.search(r'<meta charset="[^"]*"\s*/?>', content)
viewport_match = re.search(r'<meta name="viewport" content="[^"]*"\s*/?>', content)

charset_str = charset_match.group(0) if charset_match else '<meta charset="UTF-8" />'
viewport_str = viewport_match.group(0) if viewport_match else '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'

if charset_match:
    content = content.replace(charset_match.group(0), '')
if viewport_match:
    content = content.replace(viewport_match.group(0), '')
    
head_start = '<head>'
if head_start in content:
    insert_idx = content.find(head_start) + len(head_start)
    insertion = f'\n    {charset_str}\n    {viewport_str}'
    content = content[:insert_idx] + insertion + content[insert_idx:]

if '<meta name="theme-color"' not in content and '</head>' in content:
    head_end_idx = content.find('</head>')
    content = content[:head_end_idx] + '    <meta name="theme-color" content="#ffffff" />\n  ' + content[head_end_idx:]

content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed about.html structure.")
