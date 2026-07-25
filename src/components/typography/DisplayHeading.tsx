'use client';

import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import styles from './DisplayHeading.module.scss';

type Step = 'd1' | 'd2' | 'd3' | 'd4';

/**
 * Allowed host elements. A closed set rather than `ElementType` — see the note in
 * MonoLabel for why the open union breaks prop checking under React 19 types.
 */
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';

interface DisplayHeadingProps {
  /**
   * Authored lines. Line breaks in display type are a typographic decision, so
   * they are written in the content files rather than left to the browser.
   */
  lines: readonly string[];
  as?: HeadingTag;
  step?: Step;
  /** Right-aligned or centred variants for compositional variety. */
  align?: 'start' | 'end' | 'center';
  /** Renders the final line in the muted tone — used to de-emphasise a clause. */
  dimLast?: boolean;
  /** Disables the reveal for headings already in view on load (the hero). */
  immediate?: boolean;
  className?: string;
  id?: string;
}

/**
 * Display typography with a line-boundary reveal.
 *
 * Each line is masked by its own overflow container and rises into place, which is
 * why the lines are authored rather than wrapped: a reveal that animates on
 * browser-determined line breaks re-staggers on every resize.
 *
 * Under `prefers-reduced-motion` the transform is dropped entirely and the whole
 * heading fades — the content and its order are unchanged.
 */
export function DisplayHeading({
  lines,
  as = 'h2',
  step = 'd2',
  align = 'start',
  dimLast = false,
  immediate = false,
  className,
  id,
}: DisplayHeadingProps) {
  // A representative element for typing; the rendered tag is whatever `as` says.
  const Tag = as as 'div';
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const inners = root.querySelectorAll<HTMLElement>(`.${styles.inner}`);
    if (inners.length === 0) return;

    const reduced = prefersReducedMotion();

    if (reduced) {
      // Simple fade, no transform, no stagger.
      gsap.set(inners, { yPercent: 0, opacity: 1 });
      const tween = gsap.fromTo(
        root,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          ease: 'none',
          scrollTrigger: immediate ? undefined : { trigger: root, start: 'top 92%', once: true },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }

    const tween = gsap.fromTo(
      inners,
      { yPercent: 108, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.05,
        // Strongly decelerating: the line arrives and settles rather than easing
        // symmetrically into place.
        ease: 'expo.out',
        stagger: 0.085,
        delay: immediate ? 0.25 : 0,
        scrollTrigger: immediate
          ? undefined
          : {
              trigger: root,
              // Fires once, slightly before the heading is fully on screen.
              start: 'top 88%',
              once: true,
            },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [lines, immediate]);

  return (
    <Tag
      id={id}
      ref={rootRef}
      className={[styles.heading, styles[step], styles[align], className]
        .filter(Boolean)
        .join(' ')}
    >
      {lines.map((line, i) => (
        <span className={styles.line} key={`${line}-${i}`}>
          <span
            className={[
              styles.inner,
              dimLast && i === lines.length - 1 ? styles.dim : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {line}
            {/*
              A trailing space so the heading's accessible name and any extracted
              text read as a sentence rather than "Intelligence,engineered forthe
              real world." The lines are block-level, so the space is collapsed and
              has no visual effect.
            */}
            {i < lines.length - 1 ? ' ' : null}
          </span>
        </span>
      ))}
    </Tag>
  );
}
