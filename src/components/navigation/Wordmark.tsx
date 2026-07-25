import Link from 'next/link';
import { company } from '@/data/company';
import styles from './Wordmark.module.scss';

interface WordmarkProps {
  /** Shows the supporting identifier beneath the wordmark. */
  withDescriptor?: boolean;
  /** Renders as plain markup instead of a link — for the footer and OG image. */
  asLink?: boolean;
  className?: string;
}

/**
 * The VGM LABS wordmark.
 *
 * Typographic, not decorative: IBM Plex Mono, letterspaced, set in two weights so
 * "VGM" reads as the mark and "LABS" as its qualifier. No icon font, no logotype
 * image — the mark is text, which means it is crisp at every size, inherits
 * colour, and is selectable and searchable.
 *
 * The glyph beside it is three connected computational nodes: a fixed triangle of
 * nodes with a signal traversing its edges. It is CSS-animated with no JavaScript
 * and stops entirely under `prefers-reduced-motion`.
 */
export function Wordmark({ withDescriptor = false, asLink = true, className }: WordmarkProps) {
  const content = (
    <>
      <NodeGlyph />
      <span className={styles.text}>
        <span className={styles.name}>
          <span className={styles.strong}>VGM</span>
          <span className={styles.light}>LABS</span>
        </span>
        {withDescriptor ? (
          <span className={styles.descriptor}>{company.descriptor}</span>
        ) : null}
      </span>
    </>
  );

  if (!asLink) {
    return (
      <span className={[styles.mark, className].filter(Boolean).join(' ')}>{content}</span>
    );
  }

  return (
    <Link
      href="/"
      className={[styles.mark, styles.link, className].filter(Boolean).join(' ')}
      aria-label={`${company.brand} — home`}
    >
      {content}
    </Link>
  );
}

/**
 * Three connected nodes.
 *
 * The three vertices stand for the three things the company insists on holding
 * together: a model, the system around it, and the environment it runs in. The
 * travelling dot is the same signal motif used throughout the Intelligence Field,
 * which is what ties the mark to the 3D system.
 */
function NodeGlyph() {
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {/* Edges first, so nodes sit over the joins. */}
      <g className={styles.edges} stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="14" y1="5" x2="23.5" y2="21" />
        <line x1="23.5" y1="21" x2="4.5" y2="21" />
        <line x1="4.5" y1="21" x2="14" y2="5" />
      </g>

      {/* The signal. `offset-path` traverses the same triangle as the edges. */}
      <circle className={styles.signal} r="1.9" cx="0" cy="0" fill="var(--amber)" />

      <g className={styles.nodes}>
        <rect x="11.6" y="2.6" width="4.8" height="4.8" />
        <rect x="21.1" y="18.6" width="4.8" height="4.8" />
        <rect x="2.1" y="18.6" width="4.8" height="4.8" />
      </g>
    </svg>
  );
}
