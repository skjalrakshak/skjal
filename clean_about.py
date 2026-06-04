import os
import re

file_path = 'about.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The big style block in about.html starts with '/*! tailwindcss v4.3.0'
# There are two of them (line 164 and 2670)
# We can use regex to remove any <style> block that contains 'html.lenis'
# as that's the signature of the injected global styles

style_blocks = re.findall(r'<style[\s\S]*?</style>', content)
for block in style_blocks:
    if 'html.lenis' in block or 'tailwindcss' in block:
        content = content.replace(block, '')

# Also remove duplicate HTML structure if it's there? The file is 6000 lines long.
# Let's write it back first.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Processed about.html. New size: {len(content)}")
