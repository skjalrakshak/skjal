import re
with open('404.html', 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(r'"Montserrat"', '"Plus Jakarta Sans", "Inter", "Segoe UI"', c)
c = re.sub(r'"Playfair Display"', '"Plus Jakarta Sans", "Inter", "Segoe UI"', c)

with open('404.html', 'w', encoding='utf-8') as f:
    f.write(c)

print("404 fixed")
