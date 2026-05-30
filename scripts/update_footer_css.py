with open(r'assets\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

new_footer_css = """/* ✨ ULTRA-PREMIUM FOOTER ✨ */
#footer {
  --foot-bg: #050505;
  --foot-fg: #ffffff;
  --foot-muted: rgba(255,255,255,0.55);
  --foot-dim: rgba(255,255,255,0.2);
  --foot-border: rgba(255,255,255,0.06);
  --foot-accent: #0070f3;
  --mii-filter: invert(1) opacity(0.9);

  position: relative;
  padding: 60px 0 20px;
  background: var(--foot-bg) !important;
  color: var(--foot-fg) !important;
  border-top: 1px solid var(--foot-border);
  overflow: hidden;
  font-family: var(--font-primary, 'Plus Jakarta Sans', sans-serif);
}

/* Glowing Top Border */
#footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #0070f3, #10b981);
  opacity: 0.8;
  z-index: 2;
}

/* Glassmorphic Background Blur */
#footer::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: radial-gradient(ellipse at bottom, rgba(0, 112, 243, 0.1), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.foot-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 40px;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.foot-brand-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.foot-mii-img {
  filter: var(--mii-filter) !important;
  width: 140px;
  height: auto;
  object-fit: contain;
}

.foot-brand-details {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--foot-muted);
}

.foot-brand-details strong {
  color: var(--foot-fg);
  font-weight: 600;
}

.foot-brand-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.foot-col-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--foot-fg) !important;
  margin-bottom: 24px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.foot-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.foot-links a {
  color: var(--foot-muted) !important;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 400;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.foot-links a svg {
  opacity: 0.5;
  transition: all 0.3s ease;
}

.foot-links a:hover {
  color: var(--foot-fg) !important;
  transform: translateX(4px);
}

.foot-links a:hover svg {
  opacity: 1;
  color: var(--foot-accent) !important;
}

.foot-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--foot-border);
  font-size: 0.85rem;
  color: var(--foot-muted);
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.foot-legal a {
  color: var(--foot-muted);
  text-decoration: none;
  transition: color 0.3s ease;
  margin-left: 20px;
}

.foot-legal a:hover {
  color: var(--foot-fg);
}

@media (max-width: 900px) {
  .foot-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px 20px;
  }
}

@media (max-width: 600px) {
  .foot-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .foot-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  .foot-legal a {
    margin: 0 10px;
  }
}
"""

start_idx = css.find('/* ✨ FOOTER')
if start_idx == -1:
    start_idx = css.find('FOOTER — THEME-INVERTED')
    if start_idx != -1:
        # Step back to the /*
        start_idx = css.rfind('/*', 0, start_idx)

end_idx = css.find('@property --tw-scale-x')

if start_idx != -1 and end_idx != -1:
    updated_css = css[:start_idx] + new_footer_css + "\n" + css[end_idx:]
    with open(r'assets\css\style.css', 'w', encoding='utf-8') as f:
        f.write(updated_css)
    print("Successfully updated footer CSS via indices.")
else:
    print(f"Failed to find indices. Start: {start_idx}, End: {end_idx}")
