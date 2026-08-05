'use client';

import { useRef, useState } from 'react';
import { MonoLabel } from '@/components/typography/MonoLabel';
import {
  BUDGET_OPTIONS,
  CONTACT_STAGES,
  DEPLOYMENT_OPTIONS,
  LIMITS,
  emptySubmission,
  isConsumerEmail,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactSubmission,
} from '@/lib/validation/contact';
import {
  CONTACT_EMAIL,
  activeTransport,
  deliverContact,
  formatSubmission,
  type DeliveryResult,
} from '@/lib/contact/transport';
import {
  checkThrottle,
  formatRetryAfter,
  recordSubmission,
} from '@/lib/contact/throttle';
import { HoneypotField, OptionGroup, TextAreaField, TextField } from './Field';
import styles from './ContactForm.module.scss';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Contact form.
 *
 * Validation runs on blur for fields the visitor has already left, and on every
 * field at submit. Errors never appear while someone is still typing into a field
 * for the first time — being told an email is invalid halfway through entering it is
 * the most common way forms feel hostile.
 *
 * Delivery goes through the transport adapter, so what actually happens on submit is
 * a deployment concern rather than a UI one. With the default mailto transport the
 * success state explains exactly what happened and offers the formatted message for
 * copying, because a browser with no mail handler will do nothing visible with a
 * `mailto:` link and the visitor deserves to know.
 */
export function ContactForm() {
  const [values, setValues] = useState<ContactSubmission>(emptySubmission);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const setValue = <K extends keyof ContactSubmission>(key: K, value: ContactSubmission[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      // Re-validate a field that already has an error as soon as it changes, so a
      // correction clears the message immediately rather than on the next blur.
      if (key !== 'botField' && errors[key as ContactField]) {
        const fresh = validateContact(next);
        setErrors((previous) => ({ ...previous, [key]: fresh[key as ContactField] }));
      }
      return next;
    });
  };

  const handleBlur = (field: ContactField) => {
    setTouched((current) => ({ ...current, [field]: true }));
    const fresh = validateContact(values);
    setErrors((current) => ({ ...current, [field]: fresh[field] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting') return;

    const found = validateContact(values);
    setErrors(found);
    setTouched({
      name: true,
      email: true,
      organisation: true,
      brief: true,
      stage: true,
      deployment: true,
      budget: true,
      message: true,
    });

    if (Object.keys(found).length > 0) {
      // Move the visitor to the summary rather than hunting for the first error.
      summaryRef.current?.focus();
      return;
    }

    const throttle = checkThrottle();
    if (!throttle.allowed) {
      setErrors({
        form: `That is several enquiries from this browser already. Please email ${CONTACT_EMAIL} directly, or try again in ${formatRetryAfter(
          throttle.retryAfterMs,
        )}.`,
      });
      summaryRef.current?.focus();
      return;
    }

    setStatus('submitting');
    const delivery = await deliverContact(values);
    setResult(delivery);

    if (delivery.kind === 'error' || delivery.kind === 'invalid') {
      setStatus('error');
      setErrors({ form: delivery.message });
      summaryRef.current?.focus();
      return;
    }

    recordSubmission();
    setStatus('success');
  };

  const copyToClipboard = async () => {
    const text = result?.kind === 'mailto' ? result.text : formatSubmission(values);
    try {
      await navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\n\n${text}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      // Clipboard permission denied or unavailable. The text is already visible
      // below, so the visitor can select it manually.
      setCopied(false);
    }
  };

  /* ---- Success ---------------------------------------------------------- */

  if (status === 'success') {
    const isMailto = result?.kind === 'mailto';

    return (
      <div className={styles.success} role="status" aria-live="polite">
        <MonoLabel marker tone="cyan">
          {isMailto ? 'Message prepared' : 'Message sent'}
        </MonoLabel>

        <h2 className={styles.successTitle}>
          {isMailto ? 'Your email client should now be open.' : 'Thank you — we have it.'}
        </h2>

        {isMailto ? (
          <>
            <p className={styles.successBody}>
              Your enquiry has been formatted into a message addressed to{' '}
              <strong className={styles.strong}>{CONTACT_EMAIL}</strong>. Send it from
              your mail client and it reaches us directly — nothing was transmitted
              through this website.
            </p>
            <p className={styles.successBody}>
              If nothing opened, your browser may have no mail application configured.
              Copy the message below and send it however you prefer.
            </p>

            <div className={styles.copyRow}>
              <button type="button" className={styles.copyButton} onClick={copyToClipboard}>
                {copied ? 'Copied to clipboard' : 'Copy message'}
              </button>
              <a href={`mailto:${CONTACT_EMAIL}`} className={styles.plainLink}>
                {CONTACT_EMAIL}
              </a>
            </div>

            <pre className={styles.preview}>
              {result?.kind === 'mailto' ? result.text : formatSubmission(values)}
            </pre>
          </>
        ) : (
          <p className={styles.successBody}>
            We read every enquiry ourselves and reply from{' '}
            <strong className={styles.strong}>{CONTACT_EMAIL}</strong>. If you do not
            hear back within a few working days, please email us directly — it means
            something went wrong on our side.
          </p>
        )}

        <button
          type="button"
          className={styles.resetButton}
          onClick={() => {
            setValues(emptySubmission);
            setErrors({});
            setTouched({});
            setResult(null);
            setStatus('idle');
          }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  /* ---- Form ------------------------------------------------------------- */

  const errorCount = Object.keys(errors).filter(
    (key) => key !== 'form' && errors[key as ContactField],
  ).length;
  const showSummary = (errorCount > 0 || errors.form) && Object.keys(touched).length > 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/*
        `noValidate` turns off native bubbles so the same validation rules apply
        everywhere and the messages are ours. The `required` attributes stay on the
        controls for assistive technology.
      */}

      {/* Error summary. Focusable so submit can move here, and a live region so a
          screen reader announces the count without the focus move being jarring. */}
      <div
        ref={summaryRef}
        className={styles.summary}
        tabIndex={-1}
        role="alert"
        aria-live="assertive"
        hidden={!showSummary}
      >
        {/* Nothing renders until there is something to report.
            The count used to be interpolated unconditionally, so the exported
            HTML contained the sentence "0 fields need attention before this can
            be sent." It was inside a `hidden` container and never visible, but it
            was in the markup, and a string like that has no business existing on
            a page that has not been interacted with. */}
        {errors.form ? (
          <p className={styles.summaryText}>{errors.form}</p>
        ) : errorCount > 0 ? (
          <p className={styles.summaryText}>
            {errorCount === 1
              ? 'One field needs attention before this can be sent.'
              : `${errorCount} fields need attention before this can be sent.`}
          </p>
        ) : null}
      </div>

      <div className={styles.grid}>
        <div className={styles.half}>
          <TextField
            id="name"
            label="Name"
            required
            value={values.name}
            onChange={(value) => setValue('name', value)}
            onBlur={() => handleBlur('name')}
            error={touched.name ? errors.name : undefined}
            autoComplete="name"
            maxLength={LIMITS.name.max}
            // Every other input on this form has one; the first field was the only
            // one left blank, which read as an oversight.
            placeholder="First and last name"
          />
        </div>

        <div className={styles.half}>
          <TextField
            id="email"
            type="email"
            label="Work email"
            required
            value={values.email}
            onChange={(value) => setValue('email', value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : undefined}
            // Advisory only, never blocking: independent consultants and founders
            // often have no other address.
            notice={
              touched.email && !errors.email && isConsumerEmail(values.email)
                ? 'That looks like a personal address. Fine if it is the right one — a work address just helps us place the enquiry.'
                : undefined
            }
            autoComplete="email"
            maxLength={LIMITS.email.max}
            placeholder="name@company.com"
          />
        </div>

        <div className={styles.half}>
          <TextField
            id="organisation"
            label="Organisation"
            required
            value={values.organisation}
            onChange={(value) => setValue('organisation', value)}
            onBlur={() => handleBlur('organisation')}
            error={touched.organisation ? errors.organisation : undefined}
            autoComplete="organization"
            maxLength={LIMITS.organisation.max}
            placeholder="Company, institution, or “Independent”"
          />
        </div>

        <div className={styles.full}>
          <TextAreaField
            id="brief"
            label="What are you trying to build?"
            hint="The workflow, decision or constraint matters more than the technology. A few sentences is plenty."
            required
            value={values.brief}
            onChange={(value) => setValue('brief', value)}
            onBlur={() => handleBlur('brief')}
            error={touched.brief ? errors.brief : undefined}
            rows={5}
            maxLength={LIMITS.brief.max}
            showCount
          />
        </div>

        <div className={styles.full}>
          <OptionGroup
            id="stage"
            label="Current stage"
            required
            value={values.stage}
            onChange={(value) => {
              setValue('stage', value as ContactSubmission['stage']);
              setTouched((current) => ({ ...current, stage: true }));
              setErrors((current) => ({ ...current, stage: undefined }));
            }}
            options={CONTACT_STAGES}
            error={touched.stage ? errors.stage : undefined}
          />
        </div>

        <div className={styles.full}>
          <OptionGroup
            id="deployment"
            label="Preferred deployment environment"
            hint="If it is not decided yet, say so — the constraints often decide it for us."
            required
            layout="grid"
            value={values.deployment}
            onChange={(value) => {
              setValue('deployment', value as ContactSubmission['deployment']);
              setTouched((current) => ({ ...current, deployment: true }));
              setErrors((current) => ({ ...current, deployment: undefined }));
            }}
            options={DEPLOYMENT_OPTIONS}
            error={touched.deployment ? errors.deployment : undefined}
          />
        </div>

        <div className={styles.full}>
          <OptionGroup
            id="budget"
            label="Budget range"
            hint="Indicative only, and genuinely optional. It helps us suggest a sensible first phase rather than the wrong one."
            layout="grid"
            value={values.budget}
            onChange={(value) => setValue('budget', value as ContactSubmission['budget'])}
            options={BUDGET_OPTIONS}
            error={errors.budget}
          />
        </div>

        <div className={styles.full}>
          <TextAreaField
            id="message"
            label="Anything else"
            hint="Existing systems, timelines, data constraints, regulatory context — whatever is relevant."
            value={values.message}
            onChange={(value) => setValue('message', value)}
            onBlur={() => handleBlur('message')}
            error={touched.message ? errors.message : undefined}
            rows={4}
            maxLength={LIMITS.message.max}
            showCount
          />
        </div>
      </div>

      <HoneypotField value={values.botField} onChange={(value) => setValue('botField', value)} />

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={status === 'submitting'}>
          <span>
            {status === 'submitting'
              ? 'Preparing…'
              : activeTransport === 'mailto'
                ? 'Prepare email'
                : 'Send enquiry'}
          </span>
          {status === 'submitting' ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path d="M2 7h10M8.5 3.5 12 7l-3.5 3.5" fill="none" stroke="currentColor" />
            </svg>
          )}
        </button>

        <p className={styles.transportNote}>
          {activeTransport === 'mailto'
            ? 'This form composes an email in your own mail client. Nothing is submitted to a server, and we store nothing in your browser beyond a submission count.'
            : 'Your enquiry is sent to our form service and forwarded to us by email.'}
        </p>
      </div>
    </form>
  );
}
