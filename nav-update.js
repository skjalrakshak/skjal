const fs = require('fs');

const files = ['index.html', 'jala-rakshak.html', 'shield.html', 'energy-monitoring.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add to Desktop Nav Dropdown
    const desktopNavTarget = '<a href="/shield" target="_blank" class="nav-dropdown-item">S.H.I.E.L.D. — Driving Safety</a>';
    const desktopNavTarget2 = '<a href="/shield" class="nav-dropdown-item">S.H.I.E.L.D. — Driving Safety</a>';
    
    const desktopReplacement = '<a href="/energy-monitoring" target="_blank" class="nav-dropdown-item">Energy Monitoring</a>';
    const desktopReplacement2 = '<a href="/energy-monitoring" class="nav-dropdown-item">Energy Monitoring</a>';
    
    if (content.includes(desktopNavTarget) && !content.includes(desktopReplacement)) {
      content = content.replace(desktopNavTarget, `${desktopNavTarget}\n            ${desktopReplacement}`);
    } else if (content.includes(desktopNavTarget2) && !content.includes(desktopReplacement2)) {
      content = content.replace(desktopNavTarget2, `${desktopNavTarget2}\n            ${desktopReplacement2}`);
    }

    // Add to Mobile Nav Dropdown
    const mobileNavTarget = '<a href="/shield" target="_blank" class="nav-drawer-sublink">S.H.I.E.L.D. — Driving Safety</a>';
    const mobileNavTarget2 = '<a href="/shield" class="nav-drawer-sublink">S.H.I.E.L.D. — Driving Safety</a>';
    
    const mobileReplacement = '<a href="/energy-monitoring" target="_blank" class="nav-drawer-sublink">Energy Monitoring</a>';
    const mobileReplacement2 = '<a href="/energy-monitoring" class="nav-drawer-sublink">Energy Monitoring</a>';
    
    if (content.includes(mobileNavTarget) && !content.includes(mobileReplacement)) {
      content = content.replace(mobileNavTarget, `${mobileNavTarget}\n            ${mobileReplacement}`);
    } else if (content.includes(mobileNavTarget2) && !content.includes(mobileReplacement2)) {
      content = content.replace(mobileNavTarget2, `${mobileNavTarget2}\n            ${mobileReplacement2}`);
    }

    fs.writeFileSync(file, content);
  }
});
console.log('Navbars updated');
