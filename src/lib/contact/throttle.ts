/**
 * Submission throttle — the rate-limiting integration point.
 *
 * Honest about what this is: a client-side fixed window in `localStorage`. It stops
 * accidental double submissions and casual repeat posting from the same browser.
 * It is **not** a security control — anyone can clear storage or send requests
 * directly, and on a static host there is no server to enforce anything.
 *
 * Where the real limiter goes:
 *
 *   - HTTP transport with a form service: rely on the service's own per-key rate
 *     limiting and abuse controls (Web3Forms and Formspree both provide this).
 *   - HTTP transport with your own function: enforce a per-IP window server-side.
 *     `docs/integrations/contact-route.ts.example` contains a working
 *     implementation with a shared-store adapter, ready to copy if the site moves
 *     to a host that can run code.
 *   - mailto transport: no limiter is needed. Nothing is sent by us, and the
 *     visitor's own mail client is the delivery mechanism.
 */

const STORAGE_KEY = 'vgm.contact.submissions';

export interface ThrottleConfig {
  /** Submissions permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export const DEFAULT_THROTTLE: ThrottleConfig = {
  limit: 4,
  windowMs: 60 * 60 * 1000, // one hour
};

export interface ThrottleState {
  allowed: boolean;
  /** Milliseconds until the next submission is permitted. Zero when allowed. */
  retryAfterMs: number;
  remaining: number;
}

function readTimestamps(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is number => typeof value === 'number');
  } catch {
    // Private browsing, disabled storage, or corrupt data. Never a reason to block
    // a legitimate visitor from contacting the company.
    return [];
  }
}

function writeTimestamps(values: number[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Storage full or unavailable — the throttle degrades to permitting the
    // submission, which is the correct failure direction for a contact form.
  }
}

/** Check the throttle without consuming an attempt. */
export function checkThrottle(config: ThrottleConfig = DEFAULT_THROTTLE): ThrottleState {
  const now = Date.now();
  const recent = readTimestamps().filter((time) => now - time < config.windowMs);

  if (recent.length < config.limit) {
    return { allowed: true, retryAfterMs: 0, remaining: config.limit - recent.length };
  }

  const oldest = Math.min(...recent);
  return {
    allowed: false,
    retryAfterMs: Math.max(0, config.windowMs - (now - oldest)),
    remaining: 0,
  };
}

/** Record a submission against the window. Call only after a successful attempt. */
export function recordSubmission(config: ThrottleConfig = DEFAULT_THROTTLE): void {
  const now = Date.now();
  const recent = readTimestamps().filter((time) => now - time < config.windowMs);
  recent.push(now);
  writeTimestamps(recent);
}

/** "42 minutes" — for the message shown when the throttle is active. */
export function formatRetryAfter(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes <= 1) return 'a minute';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? 'an hour' : `${hours} hours`;
}
