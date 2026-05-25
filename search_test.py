with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace multiple newlines with single ones.
# First, convert CRLF to LF.
content_lf = content.replace('\r\n', '\n')

# Replace triple or more newlines with double newlines, and double with single where appropriate.
# Since we have doubled line endings, we have \n\n instead of \n.
# Let's check if we can just replace \n\n with \n.
# But wait! If we had genuine double newlines between paragraphs, they would become single.
# However, to restore the exact original formatting, let's look at if we can just normalize it.
# Let's see: if we split by \n, and if every second line is empty, we can filter them out!
lines = content_lf.split('\n')
clean_lines = []
for idx, line in enumerate(lines):
    # If the line is empty and the previous line was also empty, let's skip it
    if line.strip() == '' and len(clean_lines) > 0 and clean_lines[-1].strip() == '':
        continue
    # Let's also check if every second line is empty.
    # We can inspect if the file has alternating empty lines.
    clean_lines.append(line)

content_clean = '\n'.join(clean_lines)

# Let's run a test: if there are still doubled newlines, let's write it and let git diff show if it's clean.
with open('index.html', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content_clean.replace('\n', '\r\n'))

print("Cleaned up line endings in index.html.")
