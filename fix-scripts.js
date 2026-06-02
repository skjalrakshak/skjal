const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Find the script.js and init.js tags
    const scriptRegex = /<script[^>]*src=["']assets\/js\/script\.js[^"']*["'][^>]*><\/script>/gi;
    const initRegex = /<script[^>]*src=["']assets\/js\/init\.js[^"']*["'][^>]*><\/script>/gi;
    
    const scriptMatch = content.match(scriptRegex);
    const initMatch = content.match(initRegex);
    
    if (!scriptMatch) return;
    
    const scriptTag = scriptMatch[0];
    const initTag = initMatch ? initMatch[0] : '';
    
    // Check if they are already after GSAP
    const gsapIdx = content.indexOf('ScrollTrigger.min.js');
    const scriptIdx = content.indexOf(scriptTag);
    
    if (gsapIdx === -1) return;
    
    // If script.js is BEFORE GSAP, we need to move it!
    if (scriptIdx < gsapIdx) {
        console.log(`Fixing script order in ${file}...`);
        
        // Remove the old tags
        content = content.replace(scriptRegex, '');
        content = content.replace(initRegex, '');
        
        // Find the insertion point (after ScrollTrigger script tag)
        const stRegex = /(<script[^>]*src=["'][^"']*ScrollTrigger\.min\.js["'][^>]*><\/script>)/i;
        
        content = content.replace(stRegex, `$1\n    ${scriptTag}\n    ${initTag}`);
        
        fs.writeFileSync(path.join(dir, file), content);
    }
});

console.log("Done fixing HTML script tags.");
