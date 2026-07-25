'use client';

import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { architectureStages } from '@/data/capabilities';
import styles from './SystemRail.module.scss';

/**
 * The system architecture rail: input → perception → reasoning → tools → action →
 * evaluation → learning.
 *
 * One continuous hairline with seven stations, and a signal that travels it as the
 * section is scrolled. Explicitly not seven cards — the point of the graphic is
 * that these are stages of one pipeline, and a card grid would say the opposite.
 *
 * Labels alternate above and below the line so seven stations fit a desktop width
 * without abbreviating any of them.
 *
 * Motion here is scroll-scrubbed rather than damped, because the signal's position
 * *is* the information: it shows you where you are in the pipeline. That is the one
 * place in the project where tying motion directly to scroll position is right.
 */
export function SystemRail() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stationRefs = useRef<(HTMLLIElement | null)[]>([]);
  const activeIndex = useRef(-1);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const total = architectureStages.length;

    const setProgress = (progress: number) => {
      // The signal position is written as a custom property and consumed by CSS,
      // so the browser can keep the transform on the compositor.
      root.style.setProperty('--signal', String(progress));

      // Station activation is a discrete change, so it only touches the DOM when
      // the index actually moves — seven writes over the whole scroll, not one per
      // frame.
      const next = Math.min(total - 1, Math.floor(progress * total));
      if (next === activeIndex.current) return;
      activeIndex.current = next;

      stationRefs.current.forEach((station, i) => {
        if (!station) return;
        station.dataset.state = i < next ? 'passed' : i === next ? 'active' : 'pending';
      });
    };

    if (prefersReducedMotion()) {
      // No scroll-linked transformation. The rail is shown complete, which is the
      // meaningful end state, and every station reads as reached.
      setProgress(1);
      return;
    }

    const trigger = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        // Runs while the rail crosses the middle band of the viewport.
        start: 'top 78%',
        end: 'bottom 45%',
        scrub: 0.6,
        onUpdate: (self) => setProgress(self.progress),
      },
    });

    setProgress(0);

    return () => {
      trigger.scrollTrigger?.kill();
      trigger.kill();
    };
  }, []);

  return (
    <div className={styles.rail} ref={rootRef}>
      {/* The line itself, plus the portion the signal has covered. */}
      <div className={styles.track} aria-hidden="true">
        <div className={styles.trackFill} />
        <div className={styles.signal} />
      </div>

      <ol className={styles.stations}>
        {architectureStages.map((stage, i) => (
          <li
            key={stage.id}
            className={styles.station}
            data-state="pending"
            ref={(node) => {
              stationRefs.current[i] = node;
            }}
          >
            <span className={styles.tick} aria-hidden="true" />
            <span className={styles.stationBody}>
              <span className={styles.stationIndex}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.stationLabel}>{stage.label}</span>
              <span className={styles.stationNote}>{stage.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
