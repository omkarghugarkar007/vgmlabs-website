import type { ReactNode } from 'react';
import styles from './MonoLabel.module.scss';

/**
 * Allowed host elements.
 *
 * Deliberately a small closed set rather than `ElementType`. React 19's
 * `ElementType` is a union of every intrinsic tag, and TypeScript resolves a
 * union's props by intersection — which makes `children` resolve to `never`
 * because void elements like `<br>` accept none. Listing the elements this
 * component is actually used as keeps the props checkable.
 */
type MonoTag = 'span' | 'p' | 'div' | 'h2' | 'h3' | 'h4' | 'dt' | 'dd' | 'li' | 'figcaption';

interface MonoLabelProps {
  children: ReactNode;
  /** Element to render. Defaults to a span — labels are rarely headings. */
  as?: MonoTag;
  /** Signal colour. `none` keeps the muted default. */
  tone?: 'none' | 'cobalt' | 'amber' | 'cyan' | 'ink';
  /** Prefixes a small square marker, used for section eyebrows. */
  marker?: boolean;
  className?: string;
  id?: string;
}

/**
 * The site's annotation voice: IBM Plex Mono, uppercase, letterspaced, small.
 *
 * Used for section eyebrows, technical labels, reference codes and metadata.
 * Intentionally a fixed size rather than a fluid one — annotations should stay
 * quiet as the viewport grows while display type scales.
 */
export function MonoLabel({
  children,
  as = 'span',
  tone = 'none',
  marker = false,
  className,
  id,
}: MonoLabelProps) {
  // One representative element stands in for the union at the type level. The
  // rendered tag is whatever was passed; the cast only tells TypeScript which
  // element's prop types to check against.
  const Tag = as as 'span';

  return (
    <Tag
      id={id}
      className={[styles.label, styles[tone], marker ? styles.marked : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {marker ? <span className={styles.marker} aria-hidden="true" /> : null}
      {children}
    </Tag>
  );
}
