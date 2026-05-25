import re

def update_file(filepath, title, desc):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', content, flags=re.DOTALL)
    
    # Update meta description
    content = re.sub(r'<meta\s+name="description"\s+content=".*?">', f'<meta name="description" content="{desc}">', content, flags=re.DOTALL)

    # Insert scroll fix if not present
    scroll_fix = """  <script>
    // Reset scroll position on page load to prevent GSAP/Lenis from getting stuck
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  </script>
</head>"""
    if 'history.scrollRestoration' not in content:
        content = content.replace('</head>', scroll_fix)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('jal-rakshak.html', 'Jal Rakshak | IoT Water Quality Monitoring India & Sensors', 'Jal Rakshak by SK Jalrakshak is an IoT-based smart water quality monitoring platform. We provide real-time solar-powered water sensors across India.')
update_file('shield.html', 'SHIELD Driver Safety System | Whole Body Vibration Monitoring India', 'S.H.I.E.L.D. is a patent-granted AI driver safety system. Monitor whole-body vibration, road shock, and driver fatigue for commercial fleets in India.')
update_file('energy-monitoring.html', 'Real-Time Enterprise Energy Analytics & Monitoring Vizag', 'Optimize your power usage with our enterprise energy analytics in India. Real-time energy monitoring, idle detection, and carbon footprint tracking in Vizag.')
