'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { approachIntro, processSteps } from '@/data/approach';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import styles from './EngineeringApproach.module.scss';

/** viewBox height. Anchors land at 10/30/50/70/90% to match five equal rows. */
const PATH_H = 1000;
const PATH_W = 100;

/**
 * A single continuous path threading all five steps.
 *
 * Anchors sit at the vertical centre of each row and the curve leans left and
 * right between them, so the process reads as one computational route rather than
 * five stacked entries. `preserveAspectRatio="none"` lets the same path stretch to
 * whatever height the content ends up being.
 */
const PATH_D = [
  `M ${PATH_W * 0.5} 0`,
  `C ${PATH_W * 0.5} 60, ${PATH_W * 0.14} 100, ${PATH_W * 0.2} 200`, // 01
  `C ${PATH_W * 0.26} 300, ${PATH_W * 0.86} 320, ${PATH_W * 0.8} 400`, // 02
  `C ${PATH_W * 0.74} 480, ${PATH_W * 0.16} 520, ${PATH_W * 0.22} 600`, // 03
  `C ${PATH_W * 0.28} 680, ${PATH_W * 0.84} 720, ${PATH_W * 0.78} 800`, // 04
  `C ${PATH_W * 0.72} 880, ${PATH_W * 0.48} 920, ${PATH_W * 0.5} ${PATH_H}`, // 05
].join(' ');

export function EngineeringApproach() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const drawRef = useRef<SVGPathElement>(null);
  const signalRef = useRef<HTMLSpanElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const activeIndex = useRef(-1);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const path = pathRef.current;
    const draw = drawRef.current;
    const signal = signalRef.current;
    if (!root || !path || !draw || !signal) return;

    const length = path.getTotalLength();
    draw.style.strokeDasharray = `${length}`;

    const total = processSteps.length;

    const setProgress = (progress: number) => {
      // Draw the covered portion of the path.
      draw.style.strokeDashoffset = `${length * (1 - progress)}`;

      // Place the signal exactly on the curve. getPointAtLength returns viewBox
      // coordinates, converted here to percentages so the signal stays an HTML
      // element and can carry a box-shadow glow cheaply.
      const point = path.getPointAtLength(length * progress);
      signal.style.left = `${(point.x / PATH_W) * 100}%`;
      signal.style.top = `${(point.y / PATH_H) * 100}%`;
      signal.style.opacity = progress > 0.002 && progress < 0.998 ? '1' : '0';

      const next = Math.min(total - 1, Math.floor(progress * total));
      if (next === activeIndex.current) return;
      activeIndex.current = next;
      stepRefs.current.forEach((step, i) => {
        if (!step) return;
        step.dataset.state = i < next ? 'passed' : i === next ? 'active' : 'pending';
      });
    };

    if (prefersReducedMotion()) {
      // Complete and static: the path is fully drawn, every step reads as reached,
      // and nothing is tied to scroll position.
      setProgress(1);
      signal.style.opacity = '0';
      return;
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top 72%',
        end: 'bottom 55%',
        scrub: 0.5,
        onUpdate: (self) => setProgress(self.progress),
      },
    });

    setProgress(0);

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <MonoLabel marker className={styles.eyebrow}>
          04 / Approach
        </MonoLabel>
        <DisplayHeading
          as="h2"
          step="d2"
          lines={approachIntro.headlineLines}
          id="approach-heading"
        />
        <Reveal>
          <p className={styles.intro}>{approachIntro.body}</p>
        </Reveal>
      </div>

      <div className={styles.process} ref={rootRef}>
        <div className={styles.pathColumn} aria-hidden="true">
          <svg
            className={styles.svg}
            viewBox={`0 0 ${PATH_W} ${PATH_H}`}
            preserveAspectRatio="none"
            focusable="false"
          >
            {/* The full route, dim. */}
            <path
              ref={pathRef}
              d={PATH_D}
              fill="none"
              stroke="var(--metal)"
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
            />
            {/* The covered portion, bright. */}
            <path
              ref={drawRef}
              d={PATH_D}
              fill="none"
              stroke="var(--cobalt)"
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className={styles.signal} ref={signalRef} />
        </div>

        <ol className={styles.steps}>
          {processSteps.map((step, i) => (
            <li
              key={step.id}
              className={styles.step}
              data-state="pending"
              ref={(node) => {
                stepRefs.current[i] = node;
              }}
            >
              <div className={styles.stepHead}>
                <span className={styles.stepIndex}>{step.index}</span>
                <span className={styles.stepSlash} aria-hidden="true">
                  /
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
              </div>

              <p className={styles.stepBody}>{step.description}</p>

              <ul className={styles.outputs}>
                {step.outputs.map((output) => (
                  <li key={output}>{output}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.footer}>
        <Link href="/approach" className={styles.footerLink}>
          <span>How each stage is run in practice</span>
          <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M2 7h10M8.5 3.5 12 7l-3.5 3.5" fill="none" stroke="currentColor" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
