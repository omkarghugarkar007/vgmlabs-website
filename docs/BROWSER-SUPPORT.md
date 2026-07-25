# Browser support

The site is built so that capability differences change how it *looks*, never whether
it *works*. Every word of content is in the exported HTML; WebGL, `backdrop-filter`
and `offset-path` are all enhancements with defined fallbacks.

---

## Supported

| Browser | Version | Experience |
| --- | --- | --- |
| Chrome / Edge | 111+ | Full |
| Safari (macOS) | 16.4+ | Full |
| Safari (iOS/iPadOS) | 16.4+ | Full, low or medium tier |
| Firefox | 113+ | Full |
| Samsung Internet | 23+ | Full, low tier |
| Chrome / Safari, one major version back | — | Full, minor CSS differences |
| Anything older, or WebGL disabled | — | Static field, all content and navigation intact |

The 111/16.4 floor comes from `color-mix()` in `::selection` and `inert` on the mobile
menu panel. Both degrade rather than break: an older browser gets the default
selection colour, and the closed panel remains keyboard-reachable but is off screen.

Internet Explorer is not supported. Nothing has been done to accommodate it.

---

## Graceful degradation

| Feature | Fallback |
| --- | --- |
| **WebGL** unavailable, blocked or context lost | `FieldStill` — a static SVG field. It is in the exported HTML from the first paint, so this is not a swap, it is simply what stays. `FieldCanvas` also listens for `webglcontextlost` and hands back to it |
| **JavaScript** disabled or failed | All content renders. Reveal animations have no `opacity: 0` start state in CSS — the from-state is set by GSAP in a layout effect — so the worst case is no animation, never invisible content. Navigation links are real anchors. The mobile menu is the one loss: primary nav is unreachable below 1024px, but the footer carries every route |
| **`backdrop-filter`** unsupported | `@supports not` raises the nav bar's background to 93% opacity so it stays legible |
| **`offset-path`** unsupported | The travelling dot in the wordmark glyph is `opacity: 0` and only enabled inside `@supports (offset-path: path(...))`. The three nodes and their connections still draw |
| **`clip-path`** unsupported | The mobile menu panel would not animate but would still open. `.sr-only` falls back to `overflow: hidden` clipping |
| **`svh` units** unsupported | Falls back to the older viewport behaviour; the hero is slightly taller than the visible area on old iOS |
| **`text-wrap: pretty`** unsupported | Ignored; normal wrapping |
| **`aspect-ratio`** unsupported | The deployment diagram loses its square box; the SVG still scales |
| **Clipboard API** blocked | The copy button silently fails and the formatted message is displayed for manual selection |
| **`mailto:`** with no handler | The success state says so explicitly and offers the copy button — this is why the formatted text is shown rather than assumed delivered |
| **`localStorage`** disabled | The submission throttle degrades to permitting the submission, which is the correct failure direction for a contact form |
| **`DeviceOrientation`** requiring permission | Tilt parallax stays at zero. No permission prompt is requested |
| **`IntersectionObserver`** unavailable | The render gate assumes on-screen; only the tab-visibility half applies |

---

## Known platform notes

**iOS Safari**
- `100vh` includes the address bar, so the hero uses `100svh`
- Form inputs are 16px; anything smaller triggers zoom-on-focus
- `ScrollTrigger.config({ ignoreMobileResize: true })` stops address-bar
  show/hide from thrashing measured trigger positions mid-scroll
- Sustained WebGL causes thermal throttling; the low tier and adaptive downgrade
  are the mitigation

**iPadOS**
- Reports as a desktop browser but often has a coarse pointer. `initialTier()` checks
  `(pointer: coarse)` together with width rather than trusting the user agent
- Rotating mid-scroll is handled: camera distance derives from live canvas aspect
  ratio, not from a breakpoint

**Firefox**
- `scrollbar-width: thin` is honoured; the `::-webkit-scrollbar` block is ignored
- Slightly heavier additive-blending cost; the adaptive tier handles it

**Safari, all platforms**
- `backdrop-filter` needs the `-webkit-` prefix, which is present
- Additive blending on `points` is more expensive than on Chrome, which is part of why
  the particle count is tiered rather than fixed

---

## Manual test pass

Before a release, on a real device where possible:

**Desktop — Chrome, Safari, Firefox**
- [ ] Field assembles on load, then reorganises through all five states while scrolling
- [ ] The capability chapter index highlights in step with the field
- [ ] The seven-stage rail signal tracks scroll; stations activate in order
- [ ] The process path draws and its signal follows the curve
- [ ] Selecting a deployment environment updates both the diagram and the trait table
- [ ] Capability index rows open on hover, and clicking pins one open
- [ ] Full keyboard pass: Tab reaches everything, focus is always visible, Escape
      closes the mobile menu and returns focus to its trigger
- [ ] Contact form: submit empty (summary appears and takes focus), fix fields one by
      one, submit valid, confirm the success state and the copy button

**iPad — portrait and landscape**
- [ ] Nav shows the menu panel, not a cramped inline row
- [ ] No horizontal scrolling anywhere
- [ ] The rail drops its notes rather than overflowing
- [ ] Rotating mid-scroll reframes the field without a jump
- [ ] Every tap target is comfortably reachable

**Phone**
- [ ] Composition is the redesigned one: stacked hero metadata, vertical rail, narrow
      process spine
- [ ] Field is present but quiet; text is comfortably legible over it
- [ ] No horizontal overflow at 320px
- [ ] Form is usable one-handed; no zoom on input focus
- [ ] Frame rate stays acceptable after a minute of scrolling (thermal check)

**Degraded**
- [ ] WebGL disabled — static field, all content
- [ ] JavaScript disabled — all content, real links, no invisible sections
- [ ] `prefers-reduced-motion: reduce` — field still, rail and path complete, nothing
      missing
- [ ] 400% browser zoom — no content lost, no horizontal scroll
- [ ] Print preview — field hidden, content readable
