import { publishedWork, workSection } from '@/data/projects';
import { homeEyebrow } from '@/data/navigation';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import styles from './SelectedWork.module.scss';

/**
 * Selected work.
 *
 * Renders whatever is publishable and, when nothing is, renders a composed empty
 * state instead of inventing projects. The empty state is not an apology: it says
 * what is being written up and why nothing is shown yet, which is a more credible
 * signal to a technical buyer than four fabricated case studies.
 *
 * To publish an item, set `publish: true` on it in `src/data/projects.ts` — the
 * layout below is already built for it. See `docs/CASE-STUDIES.md`.
 */
export function SelectedWork() {
  const hasWork = publishedWork.length > 0;

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

      {hasWork ? (
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
      ) : (
        <Reveal className={styles.empty}>
          <p className={styles.emptyStatement}>{workSection.emptyState.statement}</p>
          <p className={styles.emptyBody}>{workSection.emptyState.body}</p>

          <ul className={styles.pending}>
            {workSection.emptyState.pending.map((item, i) => (
              <li key={item.id} className={styles.pendingItem}>
                <span className={styles.pendingIndex}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.pendingTitle}>{item.title}</span>
                <span className={styles.pendingDiscipline}>{item.discipline}</span>
                <MonoLabel className={styles.pendingStatus}>In documentation</MonoLabel>
              </li>
            ))}
          </ul>

          <p className={styles.emptyNote}>{workSection.emptyState.note}</p>
        </Reveal>
      )}
    </div>
  );
}
