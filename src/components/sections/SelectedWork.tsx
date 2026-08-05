import { publishedWork, workSection } from '@/data/projects';
import { homeEyebrow } from '@/data/navigation';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import styles from './SelectedWork.module.scss';

/**
 * Selected work.
 *
 * Renders only real, publishable work. Nothing is invented to fill the section,
 * and there is no empty state — when there is nothing to show, the chapter is not
 * part of the page at all (see `showWorkChapter` in src/data/navigation.ts).
 *
 * To publish an item, set `publish: true` on it in `src/data/projects.ts` — the
 * layout below is already built for it, and the chapter returns to the homepage in
 * its numbered position automatically. See `docs/CASE-STUDIES.md`.
 */
export function SelectedWork() {
  // Defensive: the homepage already gates this on `showWorkChapter`, so this
  // should never be reached with nothing to show. If it is, render nothing rather
  // than a section explaining that there is nothing.
  if (publishedWork.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <MonoLabel marker className={styles.eyebrow}>
          {homeEyebrow('work')}
        </MonoLabel>
        <DisplayHeading
          as="h2"
          step="d2"
          lines={workSection.headlineLines}
          id="work-heading"
        />
      </div>

      <ul className={styles.items}>
          {publishedWork.map((item) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.itemHead}>
                <MonoLabel tone={item.kind === 'case-study' ? 'cyan' : 'amber'}>
                  {item.kind === 'case-study' ? 'Case study' : 'Capability demonstration'}
                </MonoLabel>
                <MonoLabel className={styles.itemDiscipline}>{item.discipline}</MonoLabel>
              </div>

              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemSummary}>{item.summary}</p>

              <div className={styles.itemDetail}>
                <div>
                  <MonoLabel as="h4" className={styles.detailLabel}>
                    What it establishes
                  </MonoLabel>
                  <ul className={styles.establishes}>
                    {item.establishes.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>

                <dl className={styles.spec}>
                  <div>
                    <dt>Stack</dt>
                    <dd>{item.stack.join(', ')}</dd>
                  </div>
                  <div>
                    <dt>Deployment</dt>
                    <dd>{item.deployment}</dd>
                  </div>
                  {item.client ? (
                    <div>
                      <dt>Client</dt>
                      <dd>{item.client}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </li>
          ))}
        </ul>
    </div>
  );
}
