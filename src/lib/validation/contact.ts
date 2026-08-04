/**
 * Contact form schema and validation.
 *
 * Hand-written rather than pulled from a schema library: the rules are simple, the
 * error messages need to be specific enough to act on, and this keeps the client
 * bundle free of a validator for one form.
 *
 * The same module is used by the form (on blur and on submit) and by the transport
 * adapter before anything is sent, so a submission cannot bypass validation by
 * skipping the UI. If the site ever moves to a host that can run a function, this
 * is the module the server handler imports too — one definition, both sides.
 */

export const CONTACT_STAGES = [
  { value: 'exploring', label: 'Exploring' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'existing-system', label: 'Existing system' },
  { value: 'production-scale-up', label: 'Production scale-up' },
] as const;

export const DEPLOYMENT_OPTIONS = [
  { value: 'cloud', label: 'Cloud' },
  { value: 'private-cloud', label: 'Private cloud' },
  { value: 'on-premises', label: 'On-premises' },
  { value: 'edge', label: 'Edge' },
  { value: 'air-gapped', label: 'Air-gapped' },
  { value: 'not-decided', label: 'Not decided' },
] as const;

/**
 * Indicative bands only, offered so a first conversation can start at roughly the
 * right scope. Optional, and "prefer to discuss" is a first-class answer.
 */
export const BUDGET_OPTIONS = [
  { value: 'unspecified', label: 'Prefer to discuss' },
  { value: 'under-25k', label: 'Under US$25k' },
  // Unspaced en dash. A spaced dash in a numeric range is a style error, and it
  // was also what pushed this label past the width of its chip.
  { value: '25k-100k', label: 'US$25k–100k' },
  { value: '100k-250k', label: 'US$100k–250k' },
  { value: 'over-250k', label: 'Over US$250k' },
] as const;

export type StageValue = (typeof CONTACT_STAGES)[number]['value'];
export type DeploymentValue = (typeof DEPLOYMENT_OPTIONS)[number]['value'];
export type BudgetValue = (typeof BUDGET_OPTIONS)[number]['value'];

export interface ContactSubmission {
  name: string;
  email: string;
  organisation: string;
  /** "What are you trying to build?" */
  brief: string;
  stage: StageValue | '';
  deployment: DeploymentValue | '';
  budget: BudgetValue | '';
  message: string;
  /**
   * Honeypot. A real person never sees or fills this. Any value means the
   * submission came from something that filled every input it found.
   */
  botField: string;
}

export type ContactField = Exclude<keyof ContactSubmission, 'botField'>;

export type ContactErrors = Partial<Record<ContactField | 'form', string>>;

export const emptySubmission: ContactSubmission = {
  name: '',
  email: '',
  organisation: '',
  brief: '',
  stage: '',
  deployment: '',
  budget: '',
  message: '',
  botField: '',
};

/** Field length bounds, shared with the UI so counters and limits agree. */
export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  organisation: { min: 2, max: 120 },
  brief: { min: 20, max: 1200 },
  message: { max: 2000 },
} as const;

/**
 * Email check.
 *
 * Deliberately permissive: a single @, something either side, a dot in the domain,
 * no whitespace. Stricter regexes reject valid addresses (new TLDs, plus-addressing,
 * quoted locals) and the only authoritative test is whether mail arrives.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Domains where a "work email" is almost certainly not a work email. */
const CONSUMER_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.me',
  'icloud.com',
  'protonmail.com',
  'proton.me',
  'rediffmail.com',
]);

/**
 * True for consumer mailbox providers. Used for a *non-blocking* hint, never to
 * reject: plenty of legitimate founders and independent consultants have no other
 * address, and turning them away at a contact form would be absurd.
 */
export function isConsumerEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1];
  return domain ? CONSUMER_DOMAINS.has(domain) : false;
}

const isOneOf = <T extends string>(value: string, options: readonly { value: T }[]): boolean =>
  options.some((option) => option.value === value);

/**
 * Validate a submission.
 *
 * Returns an object keyed by field. An empty object means valid. Messages describe
 * what to do rather than what went wrong ("Add a few more words about the problem"
 * rather than "Invalid input").
 */
export function validateContact(values: ContactSubmission): ContactErrors {
  const errors: ContactErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Please add your name.';
  } else if (name.length < LIMITS.name.min) {
    errors.name = 'That looks too short to be a name.';
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Please keep your name under ${LIMITS.name.max} characters.`;
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Please add an email address so we can reply.';
  } else if (email.length > LIMITS.email.max) {
    errors.email = 'That address is longer than we can accept.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please check the address — it should look like name@company.com.';
  }

  const organisation = values.organisation.trim();
  if (!organisation) {
    errors.organisation = 'Please add your organisation. Write “Independent” if that fits better.';
  } else if (organisation.length > LIMITS.organisation.max) {
    errors.organisation = `Please keep this under ${LIMITS.organisation.max} characters.`;
  }

  const brief = values.brief.trim();
  if (!brief) {
    errors.brief = 'Please describe what you are trying to build.';
  } else if (brief.length < LIMITS.brief.min) {
    errors.brief = 'A sentence or two helps — what is the workflow or decision involved?';
  } else if (brief.length > LIMITS.brief.max) {
    errors.brief = `Please keep this under ${LIMITS.brief.max} characters and put detail in the message field.`;
  }

  if (!values.stage) {
    errors.stage = 'Please choose the closest current stage.';
  } else if (!isOneOf(values.stage, CONTACT_STAGES)) {
    errors.stage = 'Please choose one of the listed stages.';
  }

  if (!values.deployment) {
    errors.deployment = 'Please choose a deployment environment, or “Not decided”.';
  } else if (!isOneOf(values.deployment, DEPLOYMENT_OPTIONS)) {
    errors.deployment = 'Please choose one of the listed environments.';
  }

  // Budget is optional, but if present it must be a known value.
  if (values.budget && !isOneOf(values.budget, BUDGET_OPTIONS)) {
    errors.budget = 'Please choose one of the listed ranges.';
  }

  if (values.message.length > LIMITS.message.max) {
    errors.message = `Please keep this under ${LIMITS.message.max} characters.`;
  }

  // The honeypot is not surfaced as a field error — a bot should not be taught
  // which input gave it away. The caller checks this separately.
  return errors;
}

/** True when the honeypot was filled, i.e. the submission is almost certainly automated. */
export function isLikelyBot(values: ContactSubmission): boolean {
  return values.botField.trim().length > 0;
}

/** Human-readable label for a stored option value. */
export function labelFor(
  value: string,
  options: readonly { value: string; label: string }[],
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
