import Link from 'next/link';
import { company, locationLine } from '@/data/company';
import { primaryNav, utilityNav } from '@/data/navigation';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Wordmark } from '@/components/navigation/Wordmark';
import styles from './Footer.module.scss';

/**
 * Site footer.
 *
 * Carries the identifying legal information the company is required to make
 * available — registered name, locality, CIN, contact address — without turning
 * the marketing site into a filing. Following the brief, capital details,
 * director details and the full registered residential-style address are
 * deliberately not published here.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          <Wordmark withDescriptor />
          <p className={styles.statement}>
            Applied AI engineering and research. Systems designed to reason, act and
            operate in real environments.
          </p>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          <div className={styles.column}>
            <MonoLabel as="h2" className={styles.columnTitle}>
              Site
            </MonoLabel>
            <ul>
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <MonoLabel as="h2" className={styles.columnTitle}>
              More
            </MonoLabel>
            <ul>
              {utilityNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <MonoLabel as="h2" className={styles.columnTitle}>
              Contact
            </MonoLabel>
            <ul>
              <li>
                <a href={`mailto:${company.email}`} className={styles.link}>
                  {company.email}
                </a>
              </li>
              <li className={styles.plain}>{locationLine}</li>
            </ul>
          </div>
        </nav>
      </div>

      <div className={styles.legal}>
        <p className={styles.legalLine}>
          <span>{company.legalName}</span>
          <span className={styles.sep} aria-hidden="true">
            /
          </span>
          <span>
            CIN&nbsp;
            <span className={styles.cin}>{company.cin}</span>
          </span>
        </p>
        <p className={styles.legalLine}>
          <span>
            &copy; {year} {company.legalName}
          </span>
          <span className={styles.sep} aria-hidden="true">
            /
          </span>
          <span>All rights reserved</span>
        </p>
      </div>
    </footer>
  );
}
