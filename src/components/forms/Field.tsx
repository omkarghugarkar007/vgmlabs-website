'use client';

import type { ReactNode } from 'react';
import styles from './Field.module.scss';

interface BaseFieldProps {
  id: string;
  label: string;
  /** Rendered under the label. Use for guidance, not for restating the label. */
  hint?: string;
  error?: string;
  required?: boolean;
  /** Non-blocking advisory, e.g. "this looks like a personal address". */
  notice?: string;
}

/**
 * Field wrapper.
 *
 * Handles the parts that are easy to get wrong and tedious to repeat:
 *   - the label is a real `<label for>`, never a placeholder
 *   - hint and error are joined into `aria-describedby` so a screen reader reads
 *     both, in that order
 *   - `aria-invalid` marks the control, and the error text is in a live region so
 *     it is announced when it appears after a blur
 *   - the required marker is visual *and* carries `required` on the control
 *
 * `renderControl` receives the wiring so each control type stays a plain element.
 */
function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  notice,
  children,
}: BaseFieldProps & { children: (props: ControlWiring) => ReactNode }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const noticeId = notice ? `${id}-notice` : undefined;
  const describedBy = [hintId, noticeId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={[styles.field, error ? styles.fieldError : ''].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : (
            <span className={styles.optional}>Optional</span>
          )}
        </label>
        {hint ? (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        ) : null}
      </div>

      {children({
        id,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}

      {notice ? (
        <p id={noticeId} className={styles.notice}>
          {notice}
        </p>
      ) : null}

      {/* Errors live in a polite live region so they are announced on blur without
          interrupting whatever the visitor is typing next. */}
      <p
        id={errorId}
        className={styles.error}
        role={error ? 'alert' : undefined}
        hidden={!error}
      >
        {error}
      </p>
    </div>
  );
}

interface ControlWiring {
  id: string;
  required?: boolean;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

/* -------------------------------------------------------------------------- */

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email';
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
}

export function TextField({
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  maxLength,
  placeholder,
  ...shell
}: TextFieldProps) {
  return (
    <FieldShell {...shell}>
      {(wiring) => (
        <input
          {...wiring}
          className={styles.input}
          type={type}
          name={shell.id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder}
          // Never rely on the placeholder as the label; it is supplementary.
          spellCheck={type === 'email' ? false : undefined}
        />
      )}
    </FieldShell>
  );
}

/* -------------------------------------------------------------------------- */

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  /** Shows a live character counter once past 70% of the limit. */
  showCount?: boolean;
}

export function TextAreaField({
  value,
  onChange,
  onBlur,
  rows = 4,
  maxLength,
  placeholder,
  showCount = false,
  ...shell
}: TextAreaFieldProps) {
  const nearLimit = Boolean(maxLength && value.length > maxLength * 0.7);

  return (
    <FieldShell {...shell}>
      {(wiring) => (
        <div className={styles.textareaWrap}>
          <textarea
            {...wiring}
            className={styles.textarea}
            name={shell.id}
            value={value}
            rows={rows}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            maxLength={maxLength}
            placeholder={placeholder}
          />
          {showCount && maxLength && nearLimit ? (
            // aria-hidden: the count is a visual aid, and announcing it on every
            // keystroke would be intolerable.
            <span className={styles.count} aria-hidden="true">
              {value.length} / {maxLength}
            </span>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}

/* -------------------------------------------------------------------------- */

interface OptionGroupProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly { readonly value: string; readonly label: string }[];
  /** Layout: `row` wraps inline, `grid` is two columns. */
  layout?: 'row' | 'grid';
}

/**
 * A radio group styled as selectable chips.
 *
 * Native radios kept in the accessibility tree and visually replaced: arrow-key
 * navigation, group semantics and form association all come for free, which a
 * div-with-role implementation would have to rebuild and usually gets wrong.
 */
export function OptionGroup({
  value,
  onChange,
  options,
  layout = 'row',
  id,
  label,
  hint,
  error,
  required,
}: OptionGroupProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset
      className={[styles.field, styles.group, error ? styles.fieldError : '']
        .filter(Boolean)
        .join(' ')}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
    >
      <div className={styles.head}>
        <legend className={styles.label}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : (
            <span className={styles.optional}>Optional</span>
          )}
        </legend>
        {hint ? (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        ) : null}
      </div>

      <div className={layout === 'grid' ? styles.optionsGrid : styles.optionsRow}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={[styles.chip, checked ? styles.chipActive : '']
                .filter(Boolean)
                .join(' ')}
            >
              <input
                id={optionId}
                className={styles.radio}
                type="radio"
                name={id}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              <span className={styles.chipMark} aria-hidden="true" />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>

      <p id={errorId} className={styles.error} role={error ? 'alert' : undefined} hidden={!error}>
        {error}
      </p>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Honeypot.
 *
 * Positioned off-screen rather than `display: none` — some automation skips hidden
 * inputs but fills anything that is technically rendered. `tabIndex={-1}` and
 * `aria-hidden` keep it away from keyboard and screen-reader users, and
 * `autoComplete="off"` stops a password manager filling it on their behalf.
 */
export function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label htmlFor="vgm-contact-reference">Reference</label>
      <input
        id="vgm-contact-reference"
        name="reference"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
