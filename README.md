# Arwin AI Solutions

Multi-page Next.js site using Maya Design System and a bespoke corporate theme. The site now includes:

- **Homepage** summarising pillars, domain programmes, and recent work.
- **Projects** split into `/projects/post` (post-rebrand) and `/projects/legacy` (pre-rebrand).
- **Domain Areas** page describing services, pillars, and capability tracks.
- **JobReady.ai** workflow page with intake + automated search.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Maya Design System v2 CSS bundle
- Custom CSS theme in `src/app/globals.css`
- Node 20+ (use `nvm use 20`)

## Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Structure

- `src/app/layout.tsx` – global navigation, footer, and metadata.
- `src/app/page.tsx` – homepage content blocks.
- `src/app/projects/post` & `src/app/projects/legacy` – dedicated case-study views.
- `src/app/domains` – main domain programmes and capability tracks.
- `src/app/jobready` + `src/components/jobready/JobReadyClient.tsx` – JobReady.ai workflow + API integration.
- `src/app/api/jobs/route.ts` – fetches Remotive & Arbeitnow listings, adds deep-link fallbacks.
- `src/lib/content.ts` – shared copy/stats for all pages.

## Notes

- Custom CSS lives in `globals.css` (no Tailwind). Update variables for future theming.
- Logo favicon generated at `src/app/icon.png`.
- After `npm install`, `patch-package` ensures Maya CSS variable fixes remain applied.
