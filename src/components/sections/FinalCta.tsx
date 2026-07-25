import { company, finalCta } from '@/data/company';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import { ActionLink } from '@/components/ui/ActionLink';
import styles from './FinalCta.module.scss';

/**
 * Closing call to action.
 *
 * The tallest section on the page, and the only other place display step `d1` is
 * used. It sits over the Intelligence Field's final, stable state — the structured
 * architecture the whole scroll has been building toward — which is why the field
 * state for this section is `production`.
 */
export function FinalCta() {
  return (
    <div className={styles.wrap}>
      <MonoLabel marker tone="cyan" className={styles.eyebrow}>
        Next
      </MonoLabel>

      <DisplayHeading
        as="h2"
        step="d1"
        lines={finalCta.headlineLines}
        id="cta-heading"
        className={styles.headline}
      />

      <div className={styles.body}>
        <Reveal>
          <p className={styles.copy}>{finalCta.body}</p>
        </Reveal>

        <Reveal className={styles.actions} delay={0.1}>
          <ActionLink href={finalCta.cta.href}>{finalCta.cta.label}</ActionLink>
          <a href={`mailto:${company.email}`} className={styles.email}>
            {company.email}
          </a>
        </Reveal>
      </div>
    </div>
  );
}
