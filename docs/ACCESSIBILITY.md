# Accessibility

The site is built for the standard the brief asks for: semantic HTML, keyboard
operability, visible focus, WCAG-conscious contrast, reduced-motion support, and
complete access to every piece of information without WebGL.

This documents what is implemented and what still needs a human to check. Automated
tooling catches perhaps a third of what matters; the manual pass at the end is the
part that counts.

---

## Implemented

### Structure

- One `<h1>` per page, then `<h2>` per section and `<h3>` per item — no level skipped
- Sections carry `aria-labelledby` pointing at their own heading
- Landmarks: `<header>`, `<main id="main">`, `<footer>`, and `<nav>` elements with
  distinct `aria-label`s (`Primary`, `Footer`, `Contents`, `Layers`, `Site index`)
- A skip link is the first focusable element and becomes visible on focus
- Lists are lists: `<ol>` where order is meaningful (process steps, indices), `<ul>`
  where it is not, `<dl>` for label/value pairs
- `<time datetime>` on every date

### Keyboard

- Everything interactive is a native `<button>`, `<a>`, `<input>` or `<label>`. No
  `div` with a click handler and a `role`
- Focus rings are a single implementation (`@include focus-ring`) using `outline`, so
  they never shift layout, and they are cobalt against graphite for clear contrast
- `:focus:not(:focus-visible)` suppresses mouse-click rings only; keyboard focus is
  never removed
- The mobile menu: `aria-expanded` and `aria-controls` on the trigger, `inert` on the
  closed panel so it leaves the tab order and the accessibility tree, Escape closes it
  and returns focus to the trigger, body scroll is locked while open
- Radio groups are native `<input type="radio">` inside a `<fieldset>` with a
  `<legend>`, so arrow-key navigation and group semantics come from the platform. Only
  the appearance is replaced
- The capability index rows are `<button aria-expanded aria-controls>` disclosures.
  Hover opens a preview for pointer users; focus does the same thing, so nothing is
  hover-only
- Interactive targets are at least 44px; form controls are 48px

### Forms

- Every control has a real `<label for>`. Placeholders are supplementary, never labels
- Required fields carry `required` and a visible marker; optional fields say
  "Optional" rather than leaving it ambiguous
- Hints and errors are joined into `aria-describedby` in reading order
- `aria-invalid` on controls with errors
- Errors are in `role="alert"` regions so they are announced when they appear on blur
- An error summary at the top of the form is `role="alert"` + `tabIndex={-1}`, and
  submit moves focus there — so a screen-reader user is told what is wrong rather than
  having to hunt
- Errors describe the fix ("A sentence or two helps — what is the workflow or decision
  involved?"), not the failure
- Validation is on blur for fields already left, and on all fields at submit. Nobody is
  told their email is invalid halfway through typing it
- The success state is `role="status" aria-live="polite"`
- The honeypot is off-screen with `tabIndex={-1}`, `aria-hidden` and
  `autoComplete="off"`, so it is invisible to keyboard, AT and password managers
- `noValidate` on the form so one set of rules and messages applies everywhere; the
  `required` attributes remain for AT

### The 3D layer

- The whole field layer is `aria-hidden="true"` and `pointer-events: none`. It is
  decorative: every claim it visualises is also stated in the page copy
- The static SVG fallback is likewise `aria-hidden` with `focusable="false"`
- Nothing in the field is the only source of any information

### Motion

Under `prefers-reduced-motion: reduce`:

- ambient camera movement and pointer parallax stop entirely
- scroll-linked 3D transformation is removed — the field holds one state
- the scroll-scrubbed rail and process path render **complete**, so no information is
  withheld from someone who does not get the animation
- line-by-line reveals become plain opacity fades
- CSS keyframes are gated behind `@include motion-safe`
- the assembly sequence is skipped; the field is simply already assembled

The preference is read live via `useSyncExternalStore`, so changing the OS setting
takes effect without a reload.

There is no scroll hijacking, no pinning, no snapping and no scroll-jacked intro. The
visitor controls scrolling at all times.

### Colour and contrast

Text pairs on the `#050607` ground:

| Colour | Ratio | Used for |
| --- | --- | --- |
| `#ECE9E2` on `#050607` | ~17.4:1 | Body and display text |
| `#92979D` on `#050607` | ~7.3:1 | Secondary text |
| `#5F656B` on `#050607` | ~3.4:1 | Tertiary metadata only — mono labels, ≥ 1.75:1 above the AA large-text floor but below AA for body copy, so it is never used for anything a reader needs |
| `#4F72FF` on `#050607` | ~4.7:1 | Links, focus rings, small accents |
| `#8CE8E3` on `#050607` | ~13.1:1 | System-state text |
| `#FFB45C` on `#050607` | ~11.4:1 | Emphasis, active step |

The field sits behind content, so a `--field-veil` gradient keeps the effective
background near `#050607` where text sits, rather than relying on heavy blur.

Colour is never the only signal: active states also change a border, a marker, or the
weight of a rule.

### Other

- `lang="en"` on `<html>`
- `maximumScale: 5` — pinch zoom is never disabled
- `color-scheme: dark` so form controls and scrollbars match
- Print styles hide the field and invert to black-on-white
- Decorative SVGs carry `aria-hidden="true"` and `focusable="false"`
- No `<img>` anywhere, so no missing alt text is possible; the one raster asset is the
  social card, which the page never loads

---

## What needs a manual pass

These cannot be verified from the code.

**Screen readers** — VoiceOver (Safari) and NVDA (Firefox) at minimum:

- [ ] Heading order reads sensibly on every page with headings-only navigation
- [ ] The `<h1>` on each page reads as a sentence — display headings are authored as
      separate lines, with a trailing space between them for exactly this reason
- [ ] Landmark navigation reaches header, main, footer, and each named nav
- [ ] The capability index announces expanded/collapsed state and reads the revealed
      panel
- [ ] The deployment radio group announces its legend and the selected option, and the
      trait table update is announced politely
- [ ] Contact form: labels, hints, required state and errors are all announced; the
      error summary is read on submit
- [ ] The field layer is entirely silent

**Keyboard only**, no mouse:

- [ ] Tab through every page start to finish; focus is always visible and never
      trapped
- [ ] Focus order matches visual order
- [ ] The mobile menu opens, is navigable, closes on Escape, and returns focus
- [ ] Nothing is reachable only by hover

**Zoom and reflow:**

- [ ] 200% and 400% browser zoom: no content lost, no horizontal scrolling
- [ ] 320px viewport width: no horizontal overflow
- [ ] Text-only zoom to 200% does not clip

**Preferences:**

- [ ] `prefers-reduced-motion: reduce`: nothing animates ambiently, and the rail and
      process path show their complete state
- [ ] Windows High Contrast / forced-colors: text and focus rings remain visible.
      **This is the known weak spot** — the design leans on hairlines that
      forced-colors may drop. If it matters for your audience, add a
      `@media (forced-colors: active)` block that restores borders with `CanvasText`

**Degraded:**

- [ ] JavaScript disabled: all content present, links work. The mobile menu is the one
      loss below 1024px; the footer carries every route
- [ ] WebGL disabled: static field, no information missing

---

## Known limitations

1. **Forced-colors mode is untested.** The hairline-heavy visual language is the most
   likely thing to degrade badly.
2. **The mobile menu requires JavaScript.** Below 1024px, primary navigation is
   unavailable with JS off. The footer navigation is the fallback and is always
   present. A CSS-only disclosure would fix it at the cost of the animated panel.
3. **The capability index hover preview is pointer-specific.** Keyboard and touch get
   the same content via click/focus, so nothing is exclusive — but the interaction
   differs by input type, which is worth knowing when writing support notes.
4. **Contrast on `--ink-faint` (`#5F656B`) is ~3.4:1.** It is used only for mono
   metadata and reference codes, never for content a reader needs. If any of that text
   becomes load-bearing, promote it to `--ink-muted`.
