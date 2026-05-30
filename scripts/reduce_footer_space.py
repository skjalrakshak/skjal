with open(r'assets\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Reduce #footer padding
css = css.replace('padding: 60px 0 20px;', 'padding: 30px 0 20px;')

# Reduce grid gap and margin
css = css.replace('gap: 40px;', 'gap: 24px;')
css = css.replace('margin-bottom: 60px;', 'margin-bottom: 30px;')

# Reduce brand col gap
css = css.replace('gap: 20px;', 'gap: 12px;')

# Reduce col title margin
css = css.replace('margin-bottom: 24px;', 'margin-bottom: 16px;')

# Reduce links gap
css = css.replace('gap: 16px;', 'gap: 10px;')

# Reduce foot-bottom padding
css = css.replace('padding-top: 24px;', 'padding-top: 16px;')

with open(r'assets\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Spacing reduced successfully.")
