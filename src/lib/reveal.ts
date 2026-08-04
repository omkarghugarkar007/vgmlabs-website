import { prefersReducedMotion } from '@/lib/gsap';

/**
 * Shared rules for entrance reveals.
 *
 * `Reveal` and `DisplayHeading` both animate content into place and both had
 * their own copy of the guard logic, which is how they ended up with subtly
 * different trigger points and the same latent bug.
 *
 * ── The bug ───────────────────────────────────────────────────────────────────
 * Scrolling at a normal fast pace, the closing call-to-action rendered as a
 * completely blank screen and only came back after scrolling away and returning.
 *
 * The cause is structural, not a tuning problem. A reveal is a `fromTo` whose
 * from-state is `opacity: 0`, so for as long as the tween is in flight the
 * content is invisible. The trigger fired at `top 88%` — when the element is
 * already 12% into view — so the invisible part of the animation happened
 * *while you were looking at it*. Any hitch in the ticker (and this page drives a
 * WebGL scene, so hitches exist) stretched that into a blank panel. Landing
 * mid-section from a fast scroll or an anchor jump made it worse, because then
 * the whole section was on screen at opacity 0.
 *
 * ── The rules ─────────────────────────────────────────────────────────────────
 * 1. Only animate what is genuinely below the fold. Anything already in view, or
 *    already scrolled past, is simply made visible. Nobody can perceive an
 *    entrance for something they are already looking at, so there is nothing to
 *    lose — and it removes every "landed on it" case at once, including anchor
 *    jumps, restored scroll positions and fast flicks.
 * 2. Start the tween *before* the element enters the viewport, not after. The
 *    invisible portion then happens off screen.
 * 3. Cap how long content may stay hidden, and make the cap short enough that it
 *    reads as a slow reveal rather than a broken page.
 */

/**
 * How far below the fold an element must sit before a reveal is worth running,
 * and equally the distance ahead of the viewport at which the tween starts.
 *
 * These are deliberately the same number: an element far enough away to be
 * animated is an element whose animation begins before it is visible.
 */
export const REVEAL_MARGIN_PX = 200;

/**
 * ScrollTrigger start expressed against the margin above.
 *
 * `top bottom+=200` reads as: fire when the element's top is still 200px below
 * the bottom of the viewport.
 */
export const REVEAL_START = `top bottom+=${REVEAL_MARGIN_PX}`;

/**
 * Longest a reveal is allowed to leave content invisible before it is forced to
 * its end state.
 *
 * Was 4000ms, which is far longer than anyone will wait before deciding a page
 * is broken. Against a ~1.4s animation this is still generous enough never to
 * interfere with a healthy run.
 */
export const REVEAL_SAFETY_MS = 1400;

/**
 * Whether an entrance animation should run for this element at all.
 *
 * False for reduced motion, and false for anything not comfortably below the
 * fold — see rule 1 above. The caller is expected to put the element in its
 * final visible state when this returns false.
 */
export function shouldAnimateReveal(el: Element): boolean {
  if (prefersReducedMotion()) return false;
  if (typeof window === 'undefined') return false;

  const rect = el.getBoundingClientRect();

  // A zero-height, zero-width rect means the element is not laid out yet (a
  // `display: none` ancestor, for instance). Treat it as animatable: it cannot
  // be on screen, so the tween's from-state is not observable.
  if (rect.height === 0 && rect.width === 0 && rect.top === 0) return true;

  return rect.top > window.innerHeight + REVEAL_MARGIN_PX;
}
