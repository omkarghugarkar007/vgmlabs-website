'use client';

import { useId, useState } from 'react';
import { capabilityMatrix } from '@/data/capabilities';
import { homeEyebrow } from '@/data/navigation';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import styles from './CapabilityMatrix.module.scss';

/**
 * The extended capability index.
 *
 * Eighteen entries in a dense two-column technical index, not a bento grid: fixed
 * row heights, hairline separators, reference codes, and a disclosure per row.
 *
 * Interaction model — hover reveals, but keyboard and touch are first-class:
 *   - hovering or focusing a row opens it as a preview
 *   - clicking pins it open, so it stays while you read
 *   - a pinned row suppresses hover previews, so the pointer moving across the
 *     list cannot yank the content you are reading
 *
 * That gives pointer users the reveal-on-hover the design calls for while keeping
 * the whole thing operable with Tab and Enter, and usable on a touch screen where
 * hover does not exist.
 */
export function CapabilityMatrix() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const idPrefix = useId();

  const isOpen = (id: string) => (pinned ? pinned === id : hovered === id);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <MonoLabel marker className={styles.eyebrow}>
            {homeEyebrow('matrix')}
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d3"
            lines={['Capability index']}
            id="matrix-heading"
          />
        </div>
        <p className={styles.headerNote}>
          Eighteen areas of engineering. Each entry states the work, the disciplines
          it draws on, and what the resulting system can do — not a performance
          promise.
        </p>
      </div>

      <ul className={styles.list}>
        {capabilityMatrix.map((entry) => {
          const open = isOpen(entry.id);
          const panelId = `${idPrefix}-${entry.id}`;

          return (
            <li
              key={entry.id}
              className={[styles.row, open ? styles.rowOpen : ''].filter(Boolean).join(' ')}
              onMouseEnter={() => setHovered(entry.id)}
              onMouseLeave={() => setHovered((current) => (current === entry.id ? null : current))}
            >
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setPinned((current) => (current === entry.id ? null : entry.id))}
                onFocus={() => setHovered(entry.id)}
                onBlur={() => setHovered((current) => (current === entry.id ? null : current))}
              >
                <span className={styles.ref}>{entry.ref}</span>
                <span className={styles.name}>{entry.name}</span>
                <span className={styles.marker} aria-hidden="true">
                  <span />
                  <span />
                </span>
              </button>

              <div
                id={panelId}
                className={styles.panel}
                // `hidden` rather than a height animation on a closed panel: it
                // keeps the collapsed row out of the accessibility tree and out of
                // the tab order without needing to manage `inert`.
                hidden={!open}
              >
                <p className={styles.summary}>{entry.summary}</p>

                <div className={styles.detail}>
                  <div className={styles.detailBlock}>
                    <MonoLabel as="h4" className={styles.detailLabel}>
                      Disciplines
                    </MonoLabel>
                    <ul className={styles.disciplines}>
                      {entry.disciplines.map((discipline) => (
                        <li key={discipline}>{discipline}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detailBlock}>
                    <MonoLabel as="h4" className={styles.detailLabel}>
                      System outcome
                    </MonoLabel>
                    <p className={styles.outcome}>{entry.outcome}</p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
