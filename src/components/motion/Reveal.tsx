'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import styles from './Reveal.module.scss';

/**
 * Allowed host elements. A closed set rather than `ElementType` — see the note in
 * MonoLabel for why the open union breaks prop checking under React 19 types.
 */
type RevealTag = 'div' | 'section' | 'article' | 'aside' | 'ul' | 'ol' | 'dl' | 'p';

interface RevealProps {
  children: ReactNode;
  as?: RevealTag;
  /** Stagger children instead of moving the container as one block. */
  stagger?: boolean;
  /** Seconds of delay before the reveal starts. */
  delay?: number;
  className?: string;
}

/**
 * A restrained entrance for content blocks.
 *
 * The house rule is that nothing animates merely because it entered the viewport,
 * so this is used sparingly and only where the motion carries meaning: a
 * paragraph settling under its heading, a row of technical labels resolving in
 * reading order. It runs once, moves 14px, and never repeats on scroll-back.
 *
 * Under `prefers-reduced-motion` the transform is removed and the content is
 * simply visible — there is no fade-in-on-scroll left to wait for.
 */
export function Reveal({
  children,
  as = 'div',
  stagger = false,
  delay = 0,
  className,
}: RevealProps) {
  // A representative element for typing; the rendered tag is whatever `as` says.
  const Tag = as as 'div';
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      gsap.set(el.children, { opacity: 1, y: 0 });
      return;
    }

    const targets = stagger ? Array.from(el.children) : el;

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay,
        stagger: stagger ? 0.07 : 0,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [stagger, delay]);

  return (
    <Tag ref={ref} className={[styles.reveal, className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}
