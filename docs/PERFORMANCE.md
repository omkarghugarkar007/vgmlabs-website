# Performance

The site runs a WebGL scene on every page. This documents what keeps that affordable,
and how to check it has not regressed.

---

## What is implemented

### Loading

| Measure | Where |
| --- | --- |
| WebGL bundle behind `dynamic(..., { ssr: false })` | `IntelligenceField.tsx` — three.js, R3F and postprocessing are absent from the initial HTML and the first JS chunk |
| Static field in the exported HTML | `FieldStill.tsx` — a server component, so the page has its intended composition before any JS arrives |
| Route-level code splitting | Next App Router default; each page loads only its own client components |
| Fonts self-hosted and subset | `next/font` in `layout.tsx` — Latin subset, three weights each, `display: swap`, metric-adjusted fallbacks |
| No raster imagery | The only image is the generated social card, which the page itself never loads |
| Barrel imports rewritten | `optimizePackageImports` for drei, motion and gsap |

### The 3D scene

| Measure | Where |
| --- | --- |
| One draw call for all particles | `ParticleField.tsx` — a single `points` object |
| All formations computed on the GPU | `lib/field/shaders/particles.glsl.ts` — no attribute is rewritten per frame; a state morph costs three uniform writes |
| Instanced geometry | `NodeLattice.tsx`, `SignalPulses.tsx` — one `InstancedMesh` each |
| Shared materials | One material per system; nodes share a single `meshStandardMaterial` |
| No textures | Particle sprites are computed in the fragment shader from `gl_PointCoord` |
| DPR clamped | `1.75` high / `1.4` medium / `1.25` low. Retina at 3× costs nine times the fragments of 1× for no visible gain on 2px points |
| Antialiasing off | Points and additive lines have no hard silhouettes to alias; MSAA would cost a multisampled buffer |
| Restrained post-processing | Bloom at a high luminance threshold plus a vignette. No depth-of-field, no normal pass, no multisampling |
| Adaptive particle count | 17,000 / 8,200 / 3,200 by tier |
| Scratch objects allocated once | `useMemo`'d `Vector3`/`Matrix4` in every frame loop — allocating per node per frame would produce thousands of objects a second for the GC |
| O(n²) link search bounded | Proximity search runs over ≤26 nodes, a few hundred comparisons |
| `frustumCulled={false}` where needed | Shader-displaced geometry has a meaningless bounding sphere; culling it would make the cloud vanish at some angles |

### Runtime

| Measure | Where |
| --- | --- |
| Rendering paused when the tab is hidden | `useRenderGate` → `frameloop="never"`, which stops the loop rather than skipping work inside it |
| Rendering paused when the canvas is off screen | Same hook, via `IntersectionObserver` with a 150px margin |
| Scroll and pointer never touch React state | `lib/field/signal.ts` — a mutable singleton read inside `useFrame` |
| Boolean external stores for DOM chrome | `useScrollThreshold` — React discards notifications that do not flip the value, so the nav re-renders twice for the whole page |
| Discrete field state only | `subscribeFieldState` fires once per section boundary; ~8 renders per page view |
| Frame-rate-independent damping | `advanceFieldSignal` clamps `delta` to 1/20s so a hidden tab does not teleport the field on return |
| Adaptive quality downgrade | `AdaptiveQuality.tsx` — median of 90 frames, one-directional (upgrading again would make the visuals pulse) |
| Context-loss recovery | `FieldCanvas` listens for `webglcontextlost` and hands over to the static field |
| One `backdrop-filter` on the page | The nav bar only. It is the most expensive property here; stacking it per panel is what makes glassmorphic sites stutter |
| `contain: strict` on the field layer | Isolates the fixed canvas from page repaints during scroll |

### Motion

`prefers-reduced-motion: reduce` is honoured everywhere:

- ambient camera movement and pointer parallax stop (`CameraRig` `still`)
- scroll-linked 3D transformation is removed — the field holds its first state
- the scrubbed rail and process path render complete and static
- line-by-line reveals are dropped entirely — the text is simply present, with no
  tween created at all
- CSS keyframe animations are wrapped in `@include motion-safe`

All content and navigation remain fully available.

### Responsiveness

- Mobile gets a low tier and a **redesigned composition**, not a scaled-down desktop
  one: the hero metadata becomes a stacked spec block, the seven-stage rail rotates
  vertical, the process path narrows to a spine, and the deployment diagram replaces
  the sticky panel
- 768–1180px (iPad) is treated as its own layout, not a squeeze: multi-column grids
  collapse at `xl` rather than `lg` where the content needs it, and the nav switches
  to a panel at 1024px because an inline row plus a CTA does not fit at 820px
- Camera distance derives from live canvas aspect ratio, so rotating an iPad
  mid-scroll reframes correctly
- No horizontal overflow: `overflow-x: clip` on `html` and `body`, and every wide
  element scrolls inside its own container
- 44px minimum interactive targets throughout; form controls are 48px and use 16px
  text so iOS Safari does not zoom on focus

---

## Budgets

| Metric | Target |
| --- | --- |
| First Contentful Paint (desktop, cable) | < 1.2s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.05 |
| Interaction to Next Paint | < 200ms |
| Total Blocking Time | < 250ms |
| Initial JS (excluding the WebGL chunk) | < 200 KB gzipped |
| Sustained frame rate, desktop high tier | 60fps |
| Sustained frame rate, mobile low tier | ≥ 30fps |
| Exported site size | ~5 MB, dominated by font files and the WebGL chunk |

LCP is the hero headline, which is text rendered in the exported HTML — it does not
wait for WebGL.

---

## Verifying

```bash
npm run build
npm run preview        # http://localhost:3000, serves out/ as static files
```

Then, in Chrome DevTools:

**Lighthouse** — run against the preview, mobile and desktop, with the field visible.

**Performance panel** — record 10 seconds of scrolling through the homepage. Look for:
- a steady frame line, no repeating spikes
- no long tasks over 50ms during scroll
- no growing heap across the recording (a leak in a frame loop)

**Rendering panel** — enable *Frame Rendering Stats*. Scroll the full page and confirm
the rate holds. Switch tabs and confirm rendering stops.

**Throttling** — set CPU to 4× slowdown and confirm `AdaptiveQuality` downgrades the
tier rather than the page becoming unusable.

**Reduced motion** — Rendering panel → emulate `prefers-reduced-motion: reduce`.
The field should be still, the rail and process path complete, all content present.

**No WebGL** — the honest test is a browser with WebGL disabled
(`chrome://flags` → *Disable WebGL*, or Firefox `webgl.disabled=true`). The static
field should show and every word of content should be present.

---

## Where to look if it regresses

| Symptom | First suspect |
| --- | --- |
| Text invisible on load | A reveal missing `immediateRender: false`, so its `opacity: 0` from-state was applied without the tween running |
| The field washes out the type | Bloom `luminanceThreshold` lowered, `mipmapBlur` re-enabled, or particle alpha raised in the shader |
| Content clipped mid-word | `text-wrap: nowrap` reintroduced on a display heading, or a container capping width in `ch` around one |
| A section wider than the viewport | A bare `1fr` grid track — it means `minmax(auto, 1fr)` and lets min-content win; use `minmax(0, 1fr)` |
| Frame rate drops after an edit | A new allocation inside `useFrame`, or a `setState` in a frame loop |
| Scrolling feels heavy | A second `backdrop-filter`, or a section animating a layout property instead of `transform`/`opacity` |
| LCP regresses | Something added above the fold that waits on JS |
| CLS regresses | A font change without a metric-adjusted fallback, or an element without reserved space |
| Battery drain reported | Check `frameloop` is actually reaching `never` when the tab is hidden |
| Mobile becomes janky | Check `initialTier()` still returns `low` for the device, and that `planes` is 0 on that tier |
