import Link from 'next/link';
import { researchCategories, researchSection, researchThemes } from '@/data/research';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import styles from './ResearchIndex.module.scss';

/**
 * Research themes, presented as a laboratory index.
 *
 * Themes are open questions, not results, so each entry states the question it is
 * investigating rather than an outcome. That distinction is enforced by the data
 * model: publishable write-ups live in a separate array gated on `publish`, and
 * this section renders none of them.
 *
 * A numbered index with reference codes and hairline rows, deliberately closer to
 * an archive listing than a set of feature cards.
 */
export function ResearchIndex() {
  const categoryLabel = (id: string) =>
    researchCategories.find((category) => category.id === id)?.label ?? id;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <MonoLabel marker className={styles.eyebrow}>
            06 / Research
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d2"
            lines={researchSection.headlineLines}
            id="research-heading"
          />
        </div>

        <Reveal className={styles.headerAside}>
          <p className={styles.lead}>{researchSection.body}</p>
          <p className={styles.note}>{researchSection.note}</p>
        </Reveal>
      </div>

      <ol className={styles.themes}>
        {researchThemes.map((theme) => (
          <li key={theme.id} className={styles.theme}>
            <div className={styles.themeMeta}>
              <span className={styles.themeRef}>{theme.ref}</span>
              <MonoLabel className={styles.themeCategory}>
                {categoryLabel(theme.category)}
              </MonoLabel>
            </div>

            <div className={styles.themeBody}>
              <h3 className={styles.themeTitle}>{theme.title}</h3>
              <p className={styles.themeQuestion}>{theme.question}</p>
              <p className={styles.themeDetail}>{theme.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.footer}>
        <Link href="/research" className={styles.footerLink}>
          <span>Research library</span>
          <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M2 7h10M8.5 3.5 12 7l-3.5 3.5" fill="none" stroke="currentColor" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
