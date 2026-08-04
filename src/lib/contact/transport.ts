import { company } from '@/data/company';
import {
  BUDGET_OPTIONS,
  CONTACT_STAGES,
  DEPLOYMENT_OPTIONS,
  isLikelyBot,
  labelFor,
  validateContact,
  type ContactSubmission,
} from '@/lib/validation/contact';

/**
 * Contact transport adapter.
 *
 * This site is a static export served from GitHub Pages: there is no server to
 * receive a POST. Rather than pretend otherwise, delivery is an adapter with two
 * implementations, chosen at runtime:
 *
 *   mailto (default)  The validated submission is formatted and handed to the
 *                     visitor's own mail client as a prefilled message. Nothing is
 *                     transmitted anywhere by us, no third party is involved, and
 *                     there is nothing to leak. The UI also offers the formatted
 *                     text for copying, because a browser with no mail handler will
 *                     silently do nothing with a mailto: link.
 *
 *   http              Set NEXT_PUBLIC_CONTACT_ENDPOINT to POST the submission as
 *                     JSON instead — a form service (Web3Forms, Formspree) or your
 *                     own function if the site later moves to a host that runs code.
 *
 * Adding a third transport means adding a branch to `deliverContact` and a note in
 * docs/DEPLOYMENT.md. Nothing in the form component changes.
 */

export type DeliveryResult =
  | {
      kind: 'mailto';
      /** The mailto: URL that was opened. */
      href: string;
      /** The same content as plain text, for the copy-to-clipboard fallback. */
      text: string;
      /** Where the message is addressed. */
      to: string;
    }
  | { kind: 'sent' }
  | { kind: 'invalid'; message: string }
  | { kind: 'error'; message: string };

/** Recipient. Falls back to the published address if the env var is unset. */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'info.vgmlabs@gmail.com';

const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT?.trim() || '';

/** Which transport is active. Exposed so the UI can describe what will happen. */
export const activeTransport: 'mailto' | 'http' = ENDPOINT ? 'http' : 'mailto';

/**
 * Format the submission as a plain-text email body.
 *
 * Labels rather than raw values, so the message is readable by a person and does
 * not require the reader to know the option identifiers.
 */
export function formatSubmission(values: ContactSubmission): string {
  // Derived from the configured origin rather than written out, so changing the
  // domain in one place does not leave the wrong host in every enquiry email.
  let host = 'the website';
  try {
    host = new URL(company.siteUrl).host;
  } catch {
    // A malformed NEXT_PUBLIC_SITE_URL should not stop someone contacting us.
  }

  const lines: string[] = [
    `New enquiry from ${host}`,
    '',
    `Name:          ${values.name.trim()}`,
    `Email:         ${values.email.trim()}`,
    `Organisation:  ${values.organisation.trim()}`,
    `Stage:         ${labelFor(values.stage, CONTACT_STAGES)}`,
    `Deployment:    ${labelFor(values.deployment, DEPLOYMENT_OPTIONS)}`,
  ];

  if (values.budget) {
    lines.push(`Budget:        ${labelFor(values.budget, BUDGET_OPTIONS)}`);
  }

  lines.push('', 'What they are trying to build', '—'.repeat(32), values.brief.trim());

  if (values.message.trim()) {
    lines.push('', 'Additional context', '—'.repeat(32), values.message.trim());
  }

  return lines.join('\n');
}

function buildSubject(values: ContactSubmission): string {
  const organisation = values.organisation.trim();
  const stage = labelFor(values.stage, CONTACT_STAGES);
  return `Enquiry — ${organisation} (${stage})`;
}

/**
 * Deliver a submission.
 *
 * Validates first regardless of what the UI did, so a programmatic call cannot skip
 * the rules. Bot submissions are silently accepted from the caller's point of view
 * and discarded — returning an error would tell the automation what to change.
 */
export async function deliverContact(values: ContactSubmission): Promise<DeliveryResult> {
  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) {
    return { kind: 'invalid', message: 'Some fields still need attention.' };
  }

  if (isLikelyBot(values)) {
    // Report success, do nothing. The honeypot is only useful while it stays quiet.
    return { kind: 'sent' };
  }

  if (activeTransport === 'http') {
    return deliverOverHttp(values);
  }

  return deliverOverMailto(values);
}

function deliverOverMailto(values: ContactSubmission): DeliveryResult {
  const text = formatSubmission(values);
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    buildSubject(values),
  )}&body=${encodeURIComponent(text)}`;

  if (typeof window !== 'undefined') {
    // `location.href` rather than window.open: a popup blocker will suppress a new
    // window, whereas a same-tab navigation to a mailto: URL is handled by the OS
    // and leaves the page in place.
    window.location.href = href;
  }

  return { kind: 'mailto', href, text, to: CONTACT_EMAIL };
}

async function deliverOverHttp(values: ContactSubmission): Promise<DeliveryResult> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        organisation: values.organisation.trim(),
        stage: labelFor(values.stage, CONTACT_STAGES),
        deployment: labelFor(values.deployment, DEPLOYMENT_OPTIONS),
        budget: values.budget ? labelFor(values.budget, BUDGET_OPTIONS) : undefined,
        brief: values.brief.trim(),
        message: values.message.trim() || undefined,
        subject: buildSubject(values),
      }),
    });

    if (!response.ok) {
      return {
        kind: 'error',
        message: `The form service returned ${response.status}. Please email ${CONTACT_EMAIL} instead.`,
      };
    }

    return { kind: 'sent' };
  } catch {
    // Network failure, blocked request, or an endpoint that does not exist.
    return {
      kind: 'error',
      message: `We could not reach the form service. Please email ${CONTACT_EMAIL} instead.`,
    };
  }
}
