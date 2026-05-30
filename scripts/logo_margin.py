with open(r'assets\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add negative margin to offset internal transparent padding in the image
css = css.replace('object-fit: contain;', 'object-fit: contain;\n  margin-top: -20px;\n  margin-bottom: -20px;')

with open(r'assets\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Negative margins added to footer logo.")
