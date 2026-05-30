import re

with open('about.html', 'r', encoding='utf-8') as f:
    html = f.read()

match = re.search(r'<header id="mainNav"[^>]*>.*?</header>', html, re.DOTALL)
if match:
    print(match.group(0))
else:
    print("No header found")
