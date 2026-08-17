# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** `CLAUDE.md` is a symlink to this file (`AGENTS.md`) — editing either edits both. Keep this single file as the source of truth.

## Overview

**TituLateFADE** — a static informational portal that guides FADE-UPT students (Facultad de Derecho y Ciencias Políticas, Universidad Privada de Tacna) through the four degree-certification (*titulación*) processes. Built with Astro (v7); **uses yarn** (`yarn.lock`); requires Node >= 22.12.0.

The code is still the untouched `minimal` starter (`src/pages/index.astro` is the default Astro placeholder), but the **design system and site architecture are already specified** in `docs/` — treat those as the source of truth when building pages:

- **`docs/DESIGN_BRIEF.md`** — visual system: OKLCH tokens, typography, component specs, layout patterns, effects.
- **`docs/CONTENT.md`** — site map, content models, and the full Tesis Convencional process (5 phases) in detail. A living document; parts are still marked *pendiente*.
- **`docs/ui/hero/`** — standalone HTML reference mockup of the home/hero (`hero.html`, Tailwind CDN + `screen.png`). Rough visual only — the brief, not this mockup, is authoritative for tokens and fonts.

Docs are written in Spanish and use domain terms as-is (*Guías Rápidas*, *Mesa de Partes*, *trámite*, *reglamento*, *fase*).

## Commands

Start the dev server in background mode (do not run `astro dev` in the foreground — it blocks):

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`. The server listens on `localhost:4321`.

Other commands:

- `yarn build` — build the production site to `./dist/`
- `yarn preview` — serve the built site locally
- `yarn astro check` — type-check `.astro` files (Astro installs `@astrojs/check` on first run)
- `yarn astro add <integration>` — add an integration (React, Tailwind, etc.) and wire up `astro.config.mjs`

There is no test runner or separate linter configured. Type safety comes from TypeScript strict mode (`tsconfig.json` extends `astro/tsconfigs/strict`) and `astro check`.

## Site architecture (planned — see `docs/CONTENT.md`)

- **Home** — four direct-access cards, one per process: *Tesis Convencional* (Art. 20), *Tesis en Formato de Artículo* (Art. 32), *Informe de Experiencia Profesional* (TSP Art. 35-a), *Informe de Estudio de Casos* (TSP Art. 35-b).
- **Level-2 process pages are self-contained** — each stands alone and never inherits or cross-links content from another process. The previous regulation (*reglamento anterior*) is its own independent page, **not** a toggle/selector inside Tesis.
- **Guías Rápidas** (quick-help guides) are a transversal library that is **not** in the menu and has **no navigable URL**. Each guide is a single image opened in a **modal** from the exact step that needs it — never a link/anchor to another page (v1 = image-only, no step text).
- **Process-page layout** — vertical phase rail (left) + flowing prose content (right), inspired by aut.ac.nz/study/applying. Prose, not numbered step lists; visual references (a filled FUT, a payment screen) are underlined links that open the image modal.
- **Phase-ordering invariant** — within every phase the order is: prepare documents → (if the phase has a fee) pay first so the receipt is ready → submit **one single** *trámite* via Mesa de Partes Virtual with everything attached. Payment/receipt is part of that same submission, never a separate trámite.

## Design system (specified — see `docs/DESIGN_BRIEF.md`)

- **Tailwind CSS v4**, configured **via CSS** with `@theme inline` — there is deliberately no `tailwind.config.js`.
- **Colors are OKLCH semantic tokens**: navy `#102A43` + gold `#C4A150` + paper `#F5F5F0`, **light theme only** (no dark pairs). Gold is a brand *accent*, not a text-on-light surface — use `--gold-strong` (`#8C6B1C`) for gold text on paper. Note shadcn's neutral `--accent` (hover surface) is **not** the brand gold (`--gold`); don't conflate them.
- **shadcn/ui — contemplated but NOT installed** (nor its React chain: Radix, cva, lucide, tw-animate-css). Until a page genuinely needs interactivity, build with plain `.astro` + Tailwind utilities and treat §4 of the brief as the spec. To add it: `yarn astro add react`, then `shadcn init`; start with Button (add the `gold` brand variant), Card, Badge.
- Fonts: Geist Sans (body/UI), Geist Mono (data), Montserrat Alternates (display, weights 500/700).

## Astro conventions

- **Routing is file-based**: every `.astro` or `.md` file under `src/pages/` becomes a route from its path. `index.astro` → `/`.
- **`astro.config.mjs` is empty** — no integrations, adapters, or output config yet. Adding SSR, framework components, or a deploy adapter starts here (prefer `yarn astro add`).
- **`.astro/`** holds generated types and is gitignored; `dist/` is the build output and is gitignored.
- Static assets in `public/` are served from the site root (e.g. `public/favicon.svg` → `/favicon.svg`, `public/logo_upt.png` → `/logo_upt.png`).

## Documentation

Full Astro documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
