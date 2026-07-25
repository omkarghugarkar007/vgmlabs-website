import type { LegalDocument as LegalDocumentData } from '@/types/content';
import { MonoLabel } from '@/components/typography/MonoLabel';
import styles from './LegalDocument.module.scss';

interface LegalDocumentProps {
  document: LegalDocumentData;
}

/**
 * Legal document renderer.
 *
 * Shared by the privacy and terms pages. A numbered document with a contents list
 * and anchored sections — the point of these pages is that a specific clause can be
 * found and cited, so navigation matters more than art direction here.
 *
 * Measure is capped tightly: legal text is read carefully or not at all, and a
 * 100-character line makes that harder.
 */
export function LegalDocument({ document }: LegalDocumentProps) {
  const formattedDate = new Date(`${document.effectiveDate}T00:00:00Z`).toLocaleDateString(
    'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' },
  );

  return (
    <div className={styles.layout}>
      {/* Contents. Sticky on desktop so a reader keeps their place in a long
          document. */}
      <nav className={styles.contents} aria-label="Contents">
        <MonoLabel as="h2" className={styles.contentsTitle}>
          Contents
        </MonoLabel>
        <ol>
          {document.sections.map((section, i) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className={styles.contentsLink}>
                <span className={styles.contentsIndex}>{String(i + 1).padStart(2, '0')}</span>
                <span>{section.heading}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className={styles.document}>
        <div className={styles.meta}>
          <MonoLabel>Effective</MonoLabel>
          <time dateTime={document.effectiveDate} className={styles.date}>
            {formattedDate}
          </time>
        </div>

        {document.sections.map((section, i) => (
          <section key={section.id} id={section.id} className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.headingIndex} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.heading}
            </h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}

            {section.bullets?.length ? (
              <ul className={styles.bullets}>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </div>
  );
}
