import os
import glob
import re

html_files = glob.glob('*.html')
issues = []
modifications = {}

for file in html_files:
    if file == 'old_index.html':
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    
    # 1. Image loading lazy and alt text
    # This regex is simplistic, but works for standard tags
    img_tags = re.finditer(r'<img\s+([^>]+)>', content)
    for match in img_tags:
        img_content = match.group(1)
        tag_str = match.group(0)
        new_tag_str = tag_str
        
        # Check alt
        if 'alt=' not in img_content:
            new_tag_str = new_tag_str.replace('<img ', '<img alt="SK Jalrakshak image" ')
            issues.append(f"Minor: {file} - Image missing alt attribute. Added default alt.")
            
        # Check loading
        if 'loading=' not in img_content:
            new_tag_str = new_tag_str.replace('<img ', '<img loading="lazy" ')
            issues.append(f"Minor: {file} - Image missing loading='lazy'. Added.")
            
        if new_tag_str != tag_str:
            content = content.replace(tag_str, new_tag_str)
            
    # 2. Viewport meta tag
    if '<meta name="viewport"' not in content:
        head_end = content.find('</head>')
        if head_end != -1:
            content = content[:head_end] + '    <meta name="viewport" content="width=device-width, initial-scale=1">\n' + content[head_end:]
            issues.append(f"Medium: {file} - Missing viewport meta tag. Added.")
            
    # 3. External links rel="noopener noreferrer"
    a_tags = re.finditer(r'<a\s+([^>]+)>', content)
    for match in a_tags:
        a_content = match.group(1)
        tag_str = match.group(0)
        
        if 'target="_blank"' in a_content and 'rel=' not in a_content:
            new_tag_str = tag_str.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
            content = content.replace(tag_str, new_tag_str)
            issues.append(f"Medium: {file} - target='_blank' link missing rel='noopener noreferrer'. Added.")

    if content != original_content:
        modifications[file] = content

# Apply modifications
for file, content in modifications.items():
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# Report issues
if issues:
    print(f"Found and fixed {len(issues)} issues.")
    for issue in issues[:30]:  # Limit output
        print(issue)
else:
    print("No automated issues found.")
