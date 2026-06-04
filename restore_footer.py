import re

with open('old_index.html', 'r', encoding='utf-16') as f:
    old_content = f.read()

match = re.search(r'(#footer\s*\{.*?\}\s*@media.*?})\s*@property', old_content, re.DOTALL)
if match:
    footer_css = match.group(1)
    print("Found footer CSS. Appending to style.css...")
    with open('assets/css/style.css', 'a', encoding='utf-8') as f:
        f.write('\n/* Restored Global Footer Styles */\n')
        f.write(footer_css)
        f.write('\n')
else:
    print("Could not find footer CSS in old_index.html")
    match2 = re.search(r'(#footer\s*\{[\s\S]*?})\s*@property', old_content)
    if match2:
        print("Found with alternative regex")
        with open('assets/css/style.css', 'a', encoding='utf-8') as f:
            f.write('\n/* Restored Global Footer Styles */\n')
            f.write(match2.group(1))
            f.write('\n')
