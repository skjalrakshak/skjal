import re
import glob

# 1. Read index.html and extract the perfect header
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

header_match = re.search(r'<header id="mainNav"[^>]*>.*?</header>', index_html, re.DOTALL)
if not header_match:
    print("Failed to find header in index.html")
    exit(1)

correct_header = header_match.group(0)

# 2. Apply to all other html files
files = glob.glob('*.html')
for file in files:
    if file in ['index.html', 'old_index.html']:
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace header
    new_content = re.sub(r'<header id="mainNav"[^>]*>.*?</header>', correct_header, content, flags=re.DOTALL)
    
    # 3. Fix active state
    # First, strip 'active' from all links in the header
    new_content = re.sub(r'class="nav-link active"', 'class="nav-link"', new_content)
    new_content = re.sub(r'class="nav-drawer-link active"', 'class="nav-drawer-link"', new_content)
    
    # Then add 'active' to the current page
    target_link = f'href="{file}" class="nav-link"'
    new_target_link = f'href="{file}" class="nav-link active"'
    new_content = new_content.replace(target_link, new_target_link)
    
    target_drawer_link = f'href="{file}" class="nav-drawer-link"'
    new_target_drawer_link = f'href="{file}" class="nav-drawer-link active"'
    new_content = new_content.replace(target_drawer_link, new_target_drawer_link)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Synced header in {file}")

print("Done")
