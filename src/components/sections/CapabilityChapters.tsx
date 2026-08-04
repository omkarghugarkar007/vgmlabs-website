'use client';

import Link from 'next/link';
import { FIELD_STATE_INDEX } from '@/lib/field/config';
import { useActiveFieldState } from '@/hooks/useFieldDrivers';
import { capabilityChapters } from '@/data/capabilities';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import styles from './CapabilityChapters.module.scss';

/**
 * The four core capability chapters.
 *
 * Each chapter carries `data-field-state`, so scrolling into it reorganises the
 * Intelligence Field into the corresponding formation — agents separating,
 * clusters distributing, geometry intersecting organic flow, the system settling.
 * The chapters are the narrative the field is illustrating, which is why they
 * change the same structure rather than each getting an unrelated animation.
 *
 * The index on the left highlights from the same signal that drives the 3D scene,
 * so the DOM and the WebGL layer can never disagree about which chapter is
 * active.
 */
export function CapabilityChapters() {
  const activeState = useActiveFieldState();

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <MonoLabel marker className={styles.eyebrow}>
          03 / Capabilities
        </MonoLabel>
        <DisplayHeading as="h2" step="d2" lines={['What we build']} id="capabilities-heading" />
      </div>

      <div className={styles.body}>
        {/* Chapter index. Presentational — every entry is also a heading in the
            chapter list, so this is hidden from assistive technology to avoid
            announcing the same four titles twice. */}
        <nav className={styles.index} aria-hidden="true">
          <ol>
            {capabilityChapters.map((chapter) => {
              const isActive = FIELD_STATE_INDEX[chapter.fieldState] === activeState;
              return (
                <li
                  key={chapter.id}
                  className={[styles.indexItem, isActive ? styles.indexItemActive : '']
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.indexNum}>{chapter.index}</span>
                  <span className={styles.indexLabel}>{chapter.title}</span>
                </li>
              );
            })}
          </ol>
          <p className={styles.indexNote}>
            The structure behind this page reorganises with each chapter.
          </p>
        </nav>

        <div className={styles.chapters}>
          {capabilityChapters.map((chapter) => (
            <article
              key={chapter.id}
              id={chapter.id}
              className={styles.chapter}
              data-field-state={chapter.fieldState}
            >
              <div className={styles.chapterHead}>
                <span className={styles.chapterNum} aria-hidden="true">
                  {chapter.index}
                </span>
                <span className={styles.chapterRule} aria-hidden="true" />
              </div>

              <DisplayHeading as="h3" step="d3" lines={[chapter.title]} />

              <Reveal>
                <p className={styles.chapterBody}>{chapter.description}</p>
              </Reveal>

              <Reveal as="ul" className={styles.labels} stagger>
                {chapter.labels.map((label) => (
                  <li key={label}>
                    <MonoLabel>{label}</MonoLabel>
                  </li>
                ))}
              </Reveal>

              <Link href={chapter.href} className={styles.chapterLink}>
                <span>How this layer is built</span>
                <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                  <path d="M2 7h10M8.5 3.5 12 7l-3.5 3.5" fill="none" stroke="currentColor" />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
