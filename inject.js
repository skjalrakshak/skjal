const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\koush\\OneDrive\\Desktop\\skjal';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const snippet = `\n    <script>
      if (sessionStorage.getItem('isPageTransition') === 'true') {
        document.documentElement.style.backgroundColor = '#111823';
        document.documentElement.style.visibility = 'hidden';
      }
    </script>`;

for(const file of files){
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    if(!content.includes('isPageTransition')){
        content = content.replace(/<head>/i, '<head>' + snippet);
        fs.writeFileSync(fullPath, content);
    }
}
console.log('Injected head script into ' + files.length + ' files.');
