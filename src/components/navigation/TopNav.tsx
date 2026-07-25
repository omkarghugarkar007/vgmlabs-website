'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { primaryNav } from '@/data/navigation';
import { primaryCta } from '@/data/company';
import { useScrollThreshold } from '@/hooks/useMediaQuery';
import { Wordmark } from './Wordmark';
import styles from './TopNav.module.scss';

/**
 * Fixed navigation.
 *
 * Starts nearly transparent over the hero and gains a hairline plus a low-cost
 * backdrop once the page has scrolled — enough structure to stay legible over the
 * field without becoming a solid bar.
 *
 * Navigation items are plain text with an underline that draws on hover and on the
 * active route. No pills: a row of capsules would read as tags rather than
 * navigation, and would fight the hairline grid used everywhere else.
 */
export function TopNav() {
  const pathname = usePathname();
  // Boolean snapshot of an external store: React discards every scroll
  // notification that does not flip the value, so the bar re-renders twice for the
  // whole page rather than once per scroll event.
  const scrolled = useScrollThreshold(24);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the menu whenever the route changes.
  //
  // Adjusted during render rather than in an effect — React's documented pattern
  // for derived state. An effect would render the new page once with the menu still
  // open before closing it, and this also catches history navigation, which an
  // onClick on each link would miss.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Escape closes the menu and returns focus to the control that opened it —
  // otherwise focus is orphaned in a hidden subtree.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    // Prevent the page behind the panel from scrolling while it is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  return (
    <header className={[styles.nav, scrolled ? styles.scrolled : ''].join(' ')}>
      <div className={styles.inner}>
        <Wordmark />

        <nav className={styles.links} aria-label="Primary">
          <ul className={styles.list}>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[styles.link, isActive(item.href) ? styles.linkActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link
            href={primaryCta.href}
            className={[styles.cta, isActive(primaryCta.href) ? styles.ctaActive : '']
              .filter(Boolean)
              .join(' ')}
          >
            <span>{primaryCta.label}</span>
            <svg
              className={styles.ctaArrow}
              viewBox="0 0 12 12"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" fill="none" stroke="currentColor" />
            </svg>
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.toggleLabel}>{menuOpen ? 'Close' : 'Menu'}</span>
            <span
              className={[styles.toggleGlyph, menuOpen ? styles.toggleGlyphOpen : '']
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            >
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* The mobile / tablet panel. Rendered always so the open and close
          transitions both animate; `inert` removes it from the tab order and from
          the accessibility tree while closed, which `display: none` would do too
          but without the transition. */}
      <div
        id="site-menu"
        ref={panelRef}
        className={[styles.panel, menuOpen ? styles.panelOpen : ''].filter(Boolean).join(' ')}
        inert={!menuOpen}
      >
        <ul className={styles.panelList}>
          {primaryNav.map((item, i) => (
            <li key={item.href} style={{ '--i': i } as React.CSSProperties}>
              <Link
                href={item.href}
                className={styles.panelLink}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className={styles.panelIndex}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.panelLabel}>{item.label}</span>
                {item.hint ? <span className={styles.panelHint}>{item.hint}</span> : null}
              </Link>
            </li>
          ))}
        </ul>

        <Link href={primaryCta.href} className={styles.panelCta}>
          {primaryCta.label}
        </Link>
      </div>

      <div
        className={[styles.scrim, menuOpen ? styles.scrimOpen : ''].filter(Boolean).join(' ')}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </header>
  );
}
