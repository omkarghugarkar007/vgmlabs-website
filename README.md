# VGM Labs — website

The marketing and information site for **VGM Labs AI Private Limited**, trading as
**VGM Labs**.

Next.js App Router, TypeScript, React Three Fiber, GSAP ScrollTrigger, SCSS Modules.
Exported as static HTML and served from GitHub Pages.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build         # static export into out/
npm run preview       # serve out/ locally on http://localhost:3000
npm run check         # typecheck + lint + build, i.e. what CI runs
```

Node 20.9 or newer. No environment variables are required to run or build.

### One thing to change before going live

`NEXT_PUBLIC_SITE_URL` defaults to `https://vgmlabsai.com`. Set it to the real domain —
it drives canonical URLs, the sitemap, Open Graph tags and JSON-LD `@id` values.
See **Deployment** below.

---

## What this site is

An informational site that positions VGM Labs as an applied-AI engineering and
research company. It is deliberately not a lead-generation funnel: the copy is
written to be checkable by a technical reader, failure modes are given equal billing
with capabilities, and nothing that has not happened is claimed.

Three rules the codebase enforces rather than merely intends:

1. **No fabricated claims.** No customers, revenue, funding, team size, years of
   experience, benchmark scores, partnerships, certifications, awards or testimonials
   appear anywhere. Work items and research entries are gated behind a `publish`
   flag that is currently `false` for everything, so an unfinished item cannot reach
   the page by accident.
2. **Everything works without WebGL, and without JavaScript.** All copy is real DOM
   rendered into the exported HTML. The 3D layer is decorative and marked
   `aria-hidden`; a static SVG field stands in where WebGL is unavailable or has
   failed. Reveal animations use `immediateRender: false`, so content is never
   pre-hidden waiting for a tween — if the animation never runs, the text is simply
   already there.
3. **Content lives in data files.** `src/data/*` holds every editable string. Layout
   and WebGL code contains no marketing copy.

---

## Architecture

```
src/
  app/                      routes — one directory per page, all statically exported
    layout.tsx              fonts, metadata, CSP, JSON-LD, nav/footer, field mount
    page.tsx                homepage: composes the sections and their field states
    capabilities/           six system layers, in depth
    approach/               how work is run + "AI systems fail outside the demo"
    research/               open questions, publish-gated write-ups
    company/                what the company is, registered details
    contact/                enquiry form
    privacy/  terms/        legal templates
    sitemap.ts  robots.ts   metadata routes (pinned static for export)
    icon.svg                favicon
    opengraph-image.tsx     social card, generated at build time

  components/
    layout/                 Section, PageHeader, Footer, LegalDocument
    navigation/             TopNav, Wordmark (with the animated node glyph)
    typography/             DisplayHeading (line-boundary reveal), MonoLabel
    motion/                 Reveal
    sections/               homepage sections, one file each
      deployment/           the deployment network + projected diagram
    three/                  the Intelligence Field — see below
    forms/                  ContactForm and accessible field primitives
    ui/                     ActionLink

  data/                     ALL editable copy. See docs/CONTENT.md
  hooks/                    external-store hooks, field drivers
  lib/
    field/                  field config, state bus, node graph, GLSL
    contact/                transport adapter, submission throttle
    validation/             contact schema, shared by form and any future server
    seo.ts                  metadata builders, JSON-LD
    gsap.ts                 plugin registration
  styles/                   design tokens + global stylesheet
  types/                    content types
```

### The Intelligence Field

One continuous 3D structure that reorganises as the page scrolls, through five
states: a **core** assembling from independent particles → **agentic**, where the
core separates into communicating agents → **distributed**, a network of local
processing clusters → **symbolic**, where organic flow intersects an explicit
lattice → **production**, a stabilised layered architecture.

Split into single-purpose modules:

| Module | Responsibility |
| --- | --- |
| `IntelligenceField.tsx` | Mount point, WebGL detection, static-fallback crossfade |
| `FieldCanvas.tsx` | The canvas, DPR clamping, render gating (dynamically imported) |
| `FieldScene.tsx` | Scene composition and lighting |
| `ParticleField.tsx` | Thousands of particles, one draw call |
| `NodeLattice.tsx` | Instanced geometric nodes |
| `ConnectionPaths.tsx` | Proximity-derived connection paths |
| `SignalPulses.tsx` | Signals travelling the paths |
| `TranslucentPlanes.tsx` | Occasional translucent surfaces |
| `CameraRig.tsx` | Authored camera, parallax, ambient float |
| `PostFX.tsx` | Restrained bloom + vignette |
| `AdaptiveQuality.tsx` | Frame-timing measurement and tier downgrade |
| `FieldStill.tsx` | Static SVG field — fallback and first paint |
| `lib/field/shaders/` | GLSL: all five formations, evaluated on the GPU |
| `lib/field/nodes.ts` | CPU mirror of the formations for the node graph |
| `lib/field/signal.ts` | The scroll/pointer bus — deliberately not React state |

Two design decisions worth knowing before editing:

- **All five particle formations live in the vertex shader.** Nothing is precomputed
  and no attribute is rewritten per frame; morphing between states costs three
  uniform writes. Only two states are ever active at once, so `mix()` is a genuine
  morph rather than an average of five shapes.
- **Scroll and pointer input never touch React state.** They mutate the
  `fieldSignal` singleton, which `useFrame` reads during the render loop. The one
  place field state becomes React state is the active chapter index, which changes a
  handful of times per page view.

---

## Deployment

Target: **GitHub Pages**, via `.github/workflows/deploy.yml`.

### First-time setup

1. Push to `main`.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. **Settings → Secrets and variables → Actions → Variables**, add:

   | Variable | Value | Required |
   | --- | --- | --- |
   | `SITE_URL` | `https://vgmlabsai.com` — canonical origin, no trailing slash | Recommended |
   | `SITE_CNAME` | `vgmlabsai.com` — writes `out/CNAME` for the custom domain | Only with a custom domain |
   | `BASE_PATH` | `/VGMLabs-website` — only when serving from a repo subpath | Rarely |

4. Point DNS at GitHub Pages:
   - **Apex** (`vgmlabsai.com`) — four `A` records to `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (and/or the equivalent `AAAA` records).
   - **Subdomain** (`www.vgmlabsai.com`) — one `CNAME` to `<user>.github.io`.
   - Then **Settings → Pages → Custom domain**, and tick **Enforce HTTPS** once the
     certificate has been issued.

The workflow type-checks, lints, builds, verifies the export contains
`index.html`, `404.html`, `.nojekyll`, `sitemap.xml` and `og.png`, then publishes.

### Constraints of static hosting, and how they are handled

| Constraint | Handling |
| --- | --- |
| No server, so no POST endpoint | Contact form uses a client-side transport adapter, mailto by default. See `docs/DEPLOYMENT.md` |
| No response headers | CSP is a `<meta http-equiv>` tag in the root layout; other headers are documented, not enforceable |
| No image optimisation | `images.unoptimized`; the site ships no raster imagery beyond the generated social card |
| Jekyll drops `_next/` | `.nojekyll` committed in `public/` and re-asserted by the finalize script |
| Metadata routes must be static | `export const dynamic = 'force-static'` on sitemap, robots and the OG image |
| OG route output has no file extension | `scripts/finalize-export.mjs` copies it to `out/og.png` |

Moving to Vercel or another Node host later: remove `output: 'export'` and
`trailingSlash` from `next.config.ts`, restore the `headers()` block, and copy
`docs/integrations/contact-route.ts.example` into `src/app/api/contact/route.ts`.
Nothing else changes.

---

## Documentation

| Document | Covers |
| --- | --- |
| [docs/CONTENT.md](docs/CONTENT.md) | Editing company copy, capabilities, layers, the process, deployment environments, team |
| [docs/RESEARCH.md](docs/RESEARCH.md) | Adding a real research entry and the publishing gate |
| [docs/CASE-STUDIES.md](docs/CASE-STUDIES.md) | Adding a verified case study or capability demonstration |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Hosting, DNS, the contact transport, moving to a server host |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | What is optimised, the budgets, how to verify |
| [docs/BROWSER-SUPPORT.md](docs/BROWSER-SUPPORT.md) | Supported browsers, graceful degradation, what to test |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Implemented behaviour and the manual test pass |

---

## Design system

Tokens are compile-time SCSS in `src/styles/` (`_palette`, `_type`, `_layout`,
`_motion`, aggregated by `_tokens`), mirrored into CSS custom properties in
`global.scss`. The Sass loader injects `@use "tokens" as *` into every
`*.module.scss`, so **do not add that import yourself** — Sass rejects a duplicate
load of the same module.

Palette: graphite ground (`#050607`), warm off-white text (`#ECE9E2`), and three
signal accents used as signals rather than decoration — electric cobalt (`#4F72FF`)
for structure and interaction, warm amber (`#FFB45C`) for information in transit,
pale cyan (`#8CE8E3`) for system state.

Type: Instrument Sans for display and body, IBM Plex Mono for labels, indices and
metadata. Both self-hosted via `next/font` — no request leaves the origin.

Structure is expressed through hairlines and precise alignment. Radii are 0–3px, and
there are no capsule buttons, glass cards or gradient blobs.

---

## Licence

© VGM Labs AI Private Limited. All rights reserved. The content, copy, design and
source of this site are proprietary and not licensed for reuse.
