# Advaith Dabilipuram — Software Portfolio

Static React portfolio for job applications and freelance discovery. It has no backend, database, analytics, authentication, or private API credentials.

## Local setup

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Build and verify:

```bash
npm test
npm run build
npm run preview
```

## Deployment

Deploy the generated `dist/` directory to Cloudflare Pages, Netlify, Vercel, or GitHub Pages. The site uses hash-based routes so deep links work on static hosts without rewrite rules. Connect a custom domain in the selected host, then update canonical and social metadata in `index.html` when the final domain is known.

## Updating content

Edit `src/data.ts` to change projects, products, skills, and external links. Replace `public/assets/advaith-dabilipuram-resume.pdf` with the approved resume while retaining the filename. Replace project media under `public/assets/` and update its path in `src/data.ts`.

The Sports Intelligence background uses a still frame extracted from its supplied demo recording; the video is never loaded by the website. Marketplace descriptions are static in `src/data.ts` and are not fetched for visitors.

## GitHub behavior

The initial release uses the approved project list rather than making visitor-side GitHub API requests. This avoids rate limits and third-party requests. GitHub links remain available per project; if a repository is unavailable, the rest of the page continues to work. Add a new verified project and demo URL in `src/data.ts`, then redeploy.

## Quality checks

`npm test` verifies the ASCII and scroll-percentage math. `npm run build` runs TypeScript checks and creates a production bundle. Test keyboard navigation, reduced-motion mode, and 375px/768px/1440px viewport widths before deployment.
