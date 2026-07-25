import type { ReactNode } from 'react';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  /** Mono eyebrow, e.g. "Capabilities". */
  kicker: string;
  /** Authored display lines. */
  lines: readonly string[];
  /** Standfirst paragraph. */
  lead?: string;
  /** Right-hand metadata rows — a contents list, a count, a status. */
  meta?: readonly { readonly label: string; readonly value: ReactNode }[];
  children?: ReactNode;
}

/**
 * Interior page header.
 *
 * Shares the homepage hero's grammar — mono kicker, display lines, a metadata
 * column — at a smaller scale, so interior pages read as the same publication
 * without repeating the hero.
 */
export function PageHeader({ kicker, lines, lead, meta, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <MonoLabel marker className={styles.kicker}>
        {kicker}
      </MonoLabel>

      <DisplayHeading as="h1" step="d2" lines={lines} className={styles.title} immediate />

      <div className={styles.body}>
        {lead ? (
          <Reveal delay={0.45}>
            <p className={styles.lead}>{lead}</p>
          </Reveal>
        ) : null}

        {meta?.length ? (
          <Reveal as="dl" className={styles.meta} delay={0.55} stagger>
            {meta.map((row) => (
              <div key={row.label} className={styles.metaRow}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </Reveal>
        ) : null}
      </div>

      {children}
    </header>
  );
}
