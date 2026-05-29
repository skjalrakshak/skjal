import re
import os

with open('assets/css/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the exact pattern to replace
# We'll use a regex that starts at /* ═══ INNOVATION PORTFOLIO ═══ */
# and ends right before /* 4. ENTRANCE REVEALS (Split Text & Cascade) */

pattern = r'/\* ═══ INNOVATION PORTFOLIO ═══ \*/.*?/\* 4\. ENTRANCE REVEALS \(Split Text & Cascade\) \*/'

new_css = """/* ═══ INNOVATION PORTFOLIO ═══ */
.innovation-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
@media (max-width: 1280px) {
  .innovation-grid {
    gap: 24px;
  }
}
@media (max-width: 1024px) {
  .innovation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .innovation-grid {
    grid-template-columns: 1fr;
  }
}
.innovation-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
}
.innovation-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 48px rgba(0,0,0,0.08);
  border-color: var(--card-hover-border);
}
[data-theme="dark"] .innovation-card:hover {
  box-shadow: 0 24px 48px rgba(0,0,0,0.4);
}
.innovation-card-img {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/9;
  background: var(--bg-alt);
}
.innovation-card-img img {
  position: absolute;
  top: 2.5rem;
  left: 2.5rem;
  width: calc(100% - 5rem);
  height: calc(100% - 5rem);
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 20px 30px rgba(0,0,0,0.1));
}
.innovation-card:hover .innovation-card-img img {
  transform: scale(1.05) translateY(-4px);
}
.innovation-card-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 14px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #ffffff;
  background: #0099ff;
  border-radius: 100px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.innovation-card-body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.innovation-card-title {
  font-family: var(--display) !important;
  font-size: 1.6rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
  line-height: 1.2 !important;
  color: var(--fg-head);
  margin-bottom: 6px;
}
.innovation-card-subtitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0099ff;
  margin-bottom: 16px;
}
.innovation-card-desc {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--fg-body);
  margin-bottom: 24px;
  flex-grow: 1;
}
.innovation-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.innovation-card-tags span {
  padding: 6px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fg-head);
  background: var(--nav-pill);
  border: 1px solid var(--border);
  border-radius: 100px;
  letter-spacing: 0.02em;
}
.innovation-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0099ff;
  transition: gap 0.3s ease;
  margin-top: auto;
}
.innovation-card:hover .innovation-card-cta {
  gap: 14px;
}

/* 4. ENTRANCE REVEALS (Split Text & Cascade) */"""

new_content = re.sub(pattern, new_css, content, flags=re.DOTALL)

if new_content != content:
    with open('assets/css/style.css', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("CSS successfully updated and bug eradicated.")
else:
    print("Error: Could not find the target CSS block to replace.")
