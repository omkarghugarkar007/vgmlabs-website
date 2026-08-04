import { positioning } from '@/data/company';
import { homeEyebrow } from '@/data/navigation';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import { SystemRail } from './SystemRail';
import styles from './Positioning.module.scss';

/**
 * Positioning: from models to working systems.
 *
 * Two-column asymmetric split — the heading holds the left column and stays put
 * while the argument runs down the right — followed by the full-width system rail.
 * The layout inverts the usual centred-heading-then-columns pattern deliberately,
 * so this section does not resemble the capability chapters that follow it.
 */
export function Positioning() {
  return (
    <>
      <div className={styles.split}>
        <div className={styles.left}>
          <MonoLabel marker className={styles.eyebrow}>
            {homeEyebrow('positioning')}
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d2"
            lines={positioning.headlineLines}
            id="positioning-heading"
          />
        </div>

        <div className={styles.right}>
          <Reveal>
            <p className={styles.lead}>{positioning.body}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.aside}>{positioning.aside}</p>
          </Reveal>
        </div>
      </div>

      <div className={styles.railHeader}>
        <MonoLabel>Reference architecture</MonoLabel>
        <span className={styles.railRule} aria-hidden="true" />
        <MonoLabel className={styles.railHint}>
          Scroll to trace one request through the system
        </MonoLabel>
      </div>

      <SystemRail />
    </>
  );
}
