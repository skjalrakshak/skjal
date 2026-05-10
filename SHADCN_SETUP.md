# Optional React / shadcn Setup

This project is currently a static HTML/CSS/JavaScript site. It does not use React, TypeScript, Tailwind CSS, or the shadcn component structure, so the provided `nav-header.tsx` cannot run here without migrating the app.

The live site uses an optimized vanilla GSAP version of the same hover-cursor navigation pattern to avoid adding React, Framer Motion, Tailwind, and a bundler only for one navbar.

If you later want to migrate this site to shadcn, use:

```bash
npm create vite@latest skjal-react -- --template react-ts
cd skjal-react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
npm install framer-motion lucide-react
```

Keep reusable UI components in:

```text
components/ui
```

That path matters because shadcn defaults, import aliases, and generated component references commonly assume `@/components/ui`. If a project uses another path, update `components.json` and TypeScript aliases consistently before copying third-party shadcn-style components.
