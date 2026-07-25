import type { ReactNode } from 'react';
import type { FieldStateId } from '@/types/content';
import styles from './Section.module.scss';

interface SectionProps {
  children: ReactNode;
  id?: string;
  /**
   * Claims an Intelligence Field state while this section occupies the middle of
   * the viewport. Read by the scroll driver via `[data-field-state]`.
   */
  fieldState?: FieldStateId;
  /** Vertical rhythm. Varying this per section is the point — see the note below. */
  density?: 'tight' | 'default' | 'loose' | 'flush';
  /** Draws a hairline across the top of the section. */
  rule?: boolean;
  /** Removes the shell's max-width so a child can go full-bleed. */
  bleed?: boolean;
  className?: string;
  'aria-labelledby'?: string;
}

/**
 * Section wrapper.
 *
 * Exists to keep the field-state attribute and the vertical rhythm consistent,
 * not to make every section look the same. `density` is used deliberately
 * unevenly down the page: the positioning statement breathes, the capability
 * matrix is dense, the closing call to action is the tallest thing on the site.
 * A single uniform section height is the fastest way to make a long page read as
 * a template.
 */
export function Section({
  children,
  id,
  fieldState,
  density = 'default',
  rule = false,
  bleed = false,
  className,
  'aria-labelledby': labelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      data-field-state={fieldState}
      aria-labelledby={labelledBy}
      className={[styles.section, styles[density], rule ? styles.ruled : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={bleed ? styles.bleed : styles.shell}>{children}</div>
    </section>
  );
}
