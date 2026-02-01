# Arwin Design Language v1.0

_Date: 2026-02-01_

## 1. Audit Highlights
- **Fragmented styling** – Tailwind utility fragments, bespoke inline styles, and ad-hoc CSS classes coexist, so the same surface (e.g., cards, grids) changes padding, borders, and typography per page.
- **Inconsistent typography scale** – Headings jump between Tailwind defaults (Plus Jakarta) and custom CSS (Inter) causing misaligned vertical rhythm and unpredictable responsive sizing.
- **Color usage drift** – Tokens exist in `globals.css` and `lib/tokens.ts`, yet pages still use literal hex values (`#94a3b8`, `bg-gray-900`, etc.), which breaks brand fidelity and dark-surface contrast.
- **Spacing chaos** – Every layout manually hardcodes `gap`, `padding`, and `margin`. Sections do not align to a canonical shell width or rhythm, so long-form pages feel stitched together.
- **Component duplication** – There are three different card implementations (`card`, `corporate-card`, `stat-card`), multiple pill/button styles, and timeline markup that ignores reusable primitives.

## 2. Design Principles
1. **Honest utilitarian surfaces** – High-contrast navy gradients paired with warm neutrals, subtle frosted glass, and accent highlights on actionable content only.
2. **Single typography stack** – Use Inter for body + secondary headings, and Plus Jakarta Sans for display headlines. Preserve tight tracking with consistent responsive scale.
3. **Rhythmic spacing** – Base unit `4px`. Sections follow 16/20/24 spacing multipliers with nested `Cluster`, `Stack`, and `Grid` primitives to keep padding + gap coherent.
4. **Composable primitives** – `SectionShell`, `SurfaceCard`, `TokenGrid`, `Badge`, and `Button` components manage states (e.g., hover, inverse). Pages assemble them instead of redefining.
5. **Accessible motion + contrast** – Minimum 4.5:1 on body copy, 3:1 on large type, motion uses `--ease-out` timing and honors `prefers-reduced-motion`.

## 3. Token System (v2)
```
Color core:
  Primary (Navy): 900 #0f172a, 800 #1b2537, 700 #24324a, 500 #445b7c
  Accent (Sky): 400 #61a5fc, 500 #3f8dfb, 600 #1f6fde
  Support Neutral: 50 #f4f7fb, 100 #e9eef5, 200 #d5deeb, 300 #bcc7d8, 600 #4b566c
  Status: success #20c997, warning #f9b234, danger #f87171
Type scale:
  Eyebrow 0.75rem / 700 / 0.95ch letter spacing 0.25em
  Display XL clamp(2.75rem, 5vw, 4rem)
  H2 clamp(2rem, 3vw, 2.75rem)
  H3 1.5rem, Body 1rem, Lead 1.125rem
Spacing:
  Section outer padding 6rem desktop, 3rem mobile
  Stack gap scale: xs 0.75rem, sm 1rem, md 1.5rem, lg 2rem, xl 3rem
Radius:
  Sm 8px, Md 14px, Lg 20px, Pill 9999px
Shadow palette:
  focus 0 0 0 3px rgba(97,165,252,0.35)
  card 0 20px 45px rgba(15,23,42,0.08)
```

## 4. Layout Model
- **Viewport shell** – `body > .app-shell` sets radial background + gradient mesh, interior uses a 1240px max-width `Shell`. We maintain 32px gutters on mobile, 64px on desktop.
- **Section scaffolding** – Each section uses `<SectionShell tone="default|muted|inset">` that handles padding, background, and optional divider lines.
- **Stacks & clusters** – `Stack` vertical spacing, `Cluster` for inline chips. They map to CSS utility classes `.stack-sm`, `.stack-lg`, `.cluster-md` defined once.
- **Grid tracks** – Introduce `.grid-responsive` + CSS custom properties for column repeat counts that collapse gracefully without ad-hoc inline `style` attributes.

## 5. Component Direction
- **Buttons** – Four variants: `primary`, `secondary`, `ghost`, `surface`. Each handles height, icon gap, focus ring, disabled state.
- **Cards** – `surface-card` base + modifiers `data-tone="muted|inset"`, `data-padding="tight|relaxed"`, `data-state="interactive"`.
- **Eyebrow / Heading** – Standardized `eyebrow`, `section-title`, `section-copy` classes for cross-page use.
- **Timeline** – Use CSS grid with pseudo elements; align markers to tokens.

This document is the reference for every chunk of UI work going forward.
