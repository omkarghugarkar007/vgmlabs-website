import { MAX_STATE_INDEX } from './config';

/**
 * The scroll/pointer bus between the DOM and the WebGL scene.
 *
 * Deliberately NOT React state. Scroll and pointer movement produce values at
 * frame rate; routing them through `useState` would re-render the React tree
 * dozens of times per second and stall the main thread. Instead:
 *
 *   - writers (GSAP ScrollTrigger, pointer listeners) mutate this object
 *   - readers (useFrame callbacks) read it during the render loop
 *   - only genuinely discrete changes (which capability chapter is active) go
 *     through `subscribe`, and those fire a handful of times per page
 *
 * The object is a module singleton. There is exactly one field per document.
 */

export interface FieldSignal {
  /**
   * Continuous field coordinate in [0, MAX_STATE_INDEX]. The integer part is
   * the current state; the fraction is the blend into the next one. Written by
   * the scroll driver.
   */
  target: number;
  /** Damped follower of `target`, advanced in the render loop. */
  current: number;
  /** Whole-document scroll progress in [0, 1]. Drives the nav rail. */
  scrollProgress: number;
  /** Pointer in normalised device coordinates, [-1, 1]. Raw. */
  pointerX: number;
  pointerY: number;
  /** Damped pointer, used for parallax so motion never snaps. */
  smoothX: number;
  smoothY: number;
  /** True while the pointer is over the document. Parallax eases out on leave. */
  pointerActive: boolean;
  /**
   * Assembly progress in [0, 1]. Runs once on mount: the core builds itself out
   * of independent particles instead of appearing fully formed.
   */
  assemble: number;
  /** Global amplitude multiplier. 0 under prefers-reduced-motion. */
  motion: number;
  /** Device orientation tilt, [-1, 1]. Feeds the same parallax as the pointer. */
  tiltX: number;
  tiltY: number;
  /** Set false when the tab is hidden or the canvas is scrolled out of view. */
  rendering: boolean;
}

export const fieldSignal: FieldSignal = {
  target: 0,
  current: 0,
  scrollProgress: 0,
  pointerX: 0,
  pointerY: 0,
  smoothX: 0,
  smoothY: 0,
  pointerActive: false,
  assemble: 0,
  motion: 1,
  tiltX: 0,
  tiltY: 0,
  rendering: true,
};

/** Clamp a field coordinate into range. */
export const clampFieldCoord = (value: number): number =>
  Math.min(MAX_STATE_INDEX, Math.max(0, value));

/**
 * Frame-rate independent exponential approach. `lambda` is the rate constant:
 * higher converges faster. Equivalent to three's `MathUtils.damp`, inlined so
 * this module stays free of a three.js import and can be used outside the canvas.
 */
function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}

let lastAdvance = -1;

/**
 * Advance the damped followers by one frame.
 *
 * Guarded on the clock value so it runs exactly once per frame no matter how
 * many `useFrame` subscribers call it — R3F hands every callback in a frame the
 * same `elapsedTime`, which removes any dependence on subscription order.
 */
export function advanceFieldSignal(time: number, delta: number): void {
  if (time === lastAdvance) return;
  lastAdvance = time;

  // Clamp the step: after a hidden tab or a long frame, `delta` can be seconds,
  // which would teleport the field instead of moving it.
  const dt = Math.min(delta, 1 / 20);

  // Slower than the pointer on purpose. State transitions should read as the
  // structure deciding to reorganise, not as a slider being dragged.
  fieldSignal.current = damp(fieldSignal.current, fieldSignal.target, 1.45, dt);

  const px = fieldSignal.pointerActive ? fieldSignal.pointerX : fieldSignal.tiltX;
  const py = fieldSignal.pointerActive ? fieldSignal.pointerY : fieldSignal.tiltY;
  fieldSignal.smoothX = damp(fieldSignal.smoothX, px * fieldSignal.motion, 2.6, dt);
  fieldSignal.smoothY = damp(fieldSignal.smoothY, py * fieldSignal.motion, 2.6, dt);
}

/**
 * Split the continuous field coordinate into the two adjacent states and the
 * blend between them. Only ever two states are active, which is what makes the
 * shader's `mix()` a morph rather than an average.
 */
export function resolveFieldBlend(coord: number): {
  a: number;
  b: number;
  mix: number;
} {
  const c = clampFieldCoord(coord);
  const a = Math.floor(c);
  const b = Math.min(MAX_STATE_INDEX, a + 1);
  return { a, b, mix: c - a };
}

/* -------------------------------------------------------------------------- */
/* Discrete state subscription                                                */
/* -------------------------------------------------------------------------- */

type StateListener = (index: number) => void;

const listeners = new Set<StateListener>();
let lastNotified = -1;

/**
 * Subscribe to *integer* state changes only. Used by DOM components that
 * highlight the active capability chapter. Fires at most once per state
 * boundary crossing, so React re-renders stay in single digits per page view.
 */
export function subscribeFieldState(listener: StateListener): () => void {
  listeners.add(listener);
  if (lastNotified >= 0) listener(lastNotified);
  return () => {
    listeners.delete(listener);
  };
}

/** Called by the scroll driver after writing `target`. */
export function publishFieldState(index: number): void {
  const clamped = Math.round(clampFieldCoord(index));
  if (clamped === lastNotified) return;
  lastNotified = clamped;
  for (const listener of listeners) listener(clamped);
}

/** Test/HMR helper — resets the singleton to its initial values. */
export function resetFieldSignal(): void {
  fieldSignal.target = 0;
  fieldSignal.current = 0;
  fieldSignal.scrollProgress = 0;
  fieldSignal.pointerX = 0;
  fieldSignal.pointerY = 0;
  fieldSignal.smoothX = 0;
  fieldSignal.smoothY = 0;
  fieldSignal.pointerActive = false;
  fieldSignal.assemble = 0;
  fieldSignal.motion = 1;
  fieldSignal.tiltX = 0;
  fieldSignal.tiltY = 0;
  fieldSignal.rendering = true;
  lastNotified = -1;
}
