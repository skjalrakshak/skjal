with open(r'assets\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make the Make in India logo smaller
css = css.replace('width: 140px;', 'width: 100px;')

# Reduce the brand list margin
css = css.replace('margin-top: 12px;', 'margin-top: 4px;')

# Reduce brand col gap further
css = css.replace('gap: 12px;', 'gap: 8px;')

# Reduce font size of brand details
css = css.replace('font-size: 0.85rem;', 'font-size: 0.8rem;')

with open(r'assets\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Footer CSS adjusted to be more compact.")
