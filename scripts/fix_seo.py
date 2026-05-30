import glob, re

new_title = 'Top IoT Company in Vizag | SK Jalrakshak'
new_desc = 'Leading IoT company in Vizag providing AI energy monitoring & water quality telemetry devices. Contact us for deployment.'

count = 0
for f in glob.glob('*.html'):
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        content = re.sub(r'<title>.*?</title>', f'<title>{new_title}</title>', content, flags=re.IGNORECASE | re.DOTALL)
        content = re.sub(r'<meta[^>]*name=[\'"]description[\'"][^>]*>', f'<meta name="description" content="{new_desc}" />', content, flags=re.IGNORECASE | re.DOTALL)
        content = re.sub(r'<meta[^>]*property=[\'"]og:title[\'"][^>]*>', f'<meta property="og:title" content="{new_title}" />', content, flags=re.IGNORECASE | re.DOTALL)
        content = re.sub(r'<meta[^>]*property=[\'"]og:description[\'"][^>]*>', f'<meta property="og:description" content="{new_desc}" />', content, flags=re.IGNORECASE | re.DOTALL)

        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        count += 1
    except Exception as e:
        print(f'Error {f}: {e}')

print(f'Updated {count} HTML files.')
