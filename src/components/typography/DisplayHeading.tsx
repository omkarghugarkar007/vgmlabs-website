'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { REVEAL_SAFETY_MS, REVEAL_START, shouldAnimateReveal } from '@/lib/reveal';
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

    // Simply present, with no tween at all — not even a fade. Three cases reach
    // this branch:
    //
    //   - reduced motion. The previous version animated opacity here, which was
    //     wrong twice over: it still animated for someone who asked for no
    //     animation, and it made the text depend on a tween completing in order
    //     to become visible.
    //   - the heading is already on screen. `immediate` used to be passed by hand
    //     for exactly this (the hero), which meant every other above-the-fold
    //     heading on every other page was left to animate while visible.
    //   - the heading is above the viewport, because the page was loaded scrolled
    //     or arrived at via an anchor.
    //
    // See src/lib/reveal.ts.
    if (!shouldAnimateReveal(root)) {
      gsap.set(inners, { yPercent: 0, opacity: 1, clearProps: 'willChange' });
      return;
    }

    let safety = 0;

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

        // Never pre-hide content that is not being animated yet.
        //
        // By default a `fromTo` applies its from-state the moment it is created, so
        // every heading on the page was set to `opacity: 0` on load and relied on a
        // tween firing later to become readable. Anything that stopped GSAP's
        // ticker — a starved rAF, a script error elsewhere, an aggressive power
        // saver — left the whole page's text permanently invisible.
        //
        // With `immediateRender: false` the from-state is applied only when the
        // animation actually begins, so unrevealed content stays visible.
        immediateRender: false,

        // Belt to that brace: once the tween has started, guarantee it finishes.
        // If the ticker dies mid-reveal, this jumps to the end state rather than
        // leaving text half-faded.
        onStart: () => {
          safety = window.setTimeout(() => {
            if (tween.progress() < 1) tween.progress(1);
          }, REVEAL_SAFETY_MS);
        },
        onComplete: () => window.clearTimeout(safety),

        scrollTrigger: immediate
          ? undefined
          : {
              trigger: root,
              // Fires before the heading enters the viewport, so the lines are
              // already rising by the time they can be seen.
              start: REVEAL_START,
              once: true,
            },
      },
    );

    // `immediateRender: false` means an immediate tween needs an explicit kick;
    // without a ScrollTrigger there is nothing else to start it.
    if (immediate) tween.play(0);

    return () => {
      window.clearTimeout(safety);
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
