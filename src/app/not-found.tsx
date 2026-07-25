import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/layout/Section';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { ActionLink } from '@/components/ui/ActionLink';
import { primaryNav, utilityNav } from '@/data/navigation';
import styles from './not-found.module.scss';

export const metadata: Metadata = {
  title: 'Page not found — VGM Labs',
  // A 404 has no business being indexed.
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * Static export writes this to `out/404.html`, which GitHub Pages serves
 * automatically for unmatched paths — so it works on the intended host without any
 * routing configuration.
 *
 * Offers the full site index rather than only a link home: someone arriving from a
 * stale URL usually knows roughly what they wanted.
 */
export default function NotFound() {
  return (
    <Section density="default">
      <div className={styles.wrap}>
        <MonoLabel marker tone="amber">
          Error 404
        </MonoLabel>

        <DisplayHeading
          as="h1"
          step="d2"
          lines={['This path', 'does not resolve.']}
          immediate
        />

        <p className={styles.body}>
          The page may have moved, or the link may be incomplete. Everything on the site
          is listed below.
        </p>

        <nav className={styles.index} aria-label="Site index">
          <ol>
            {[...primaryNav, ...utilityNav].map((item, i) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.link}>
                  <span className={styles.linkIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.linkLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <ActionLink href="/">Back to the homepage</ActionLink>
      </div>
    </Section>
  );
}
