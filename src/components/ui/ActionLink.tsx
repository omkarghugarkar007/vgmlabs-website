import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './ActionLink.module.scss';

interface ActionLinkProps {
  href: string;
  children: ReactNode;
  /**
   * `primary`   bordered, cobalt on hover — one per view
   * `secondary` bordered, quieter
   * `inline`    text with a drawing underline, for links in running copy
   */
  variant?: 'primary' | 'secondary' | 'inline';
  /** External links get the correct rel and an explicit affordance. */
  external?: boolean;
  className?: string;
}

/**
 * The site's only call-to-action treatment.
 *
 * Rectangular with a 3px radius rather than a pill: the visual language is
 * hairlines and precise edges, and a capsule button would be the one rounded
 * thing on the page. The arrow translates on hover — a 2px acknowledgement, not a
 * bounce.
 *
 * Minimum height is 48px on all variants so every action clears the 44px touch
 * target requirement with margin.
 */
export function ActionLink({
  href,
  children,
  variant = 'primary',
  external = false,
  className,
}: ActionLinkProps) {
  const classes = [styles.action, styles[variant], className].filter(Boolean).join(' ');

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      <svg className={styles.arrow} viewBox="0 0 14 14" aria-hidden="true" focusable="false">
        {external ? (
          <path d="M4 10 10 4M10 4H5.5M10 4v4.5" fill="none" stroke="currentColor" />
        ) : (
          <path d="M2 7h10M8.5 3.5 12 7l-3.5 3.5" fill="none" stroke="currentColor" />
        )}
      </svg>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        // noopener is implied by modern browsers for target=_blank, but stating it
        // keeps the intent explicit for older engines.
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
