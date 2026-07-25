import { hero, heroStatusLabels } from '@/data/company';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import { ActionLink } from '@/components/ui/ActionLink';
import styles from './Hero.module.scss';

/**
 * Hero.
 *
 * Full viewport, with the Intelligence Field rendered behind and around the
 * typography rather than beside it. The composition is asymmetric: the headline
 * occupies the left two-thirds, a technical metadata column sits right, and the
 * lower band carries the actions and scroll guidance.
 *
 * `data-field-state="core"` is applied by the page rather than here, so the hero
 * stays a presentational component.
 */
export function Hero() {
  return (
    <div className={styles.hero}>
      <div className={styles.grid}>
        <div className={styles.status}>
          <MonoLabel marker tone="cyan">
            {heroStatusLabels.map((label, i) => (
              <span key={label} className={styles.statusItem}>
                {i > 0 ? (
                  <span className={styles.statusSep} aria-hidden="true">
                    /
                  </span>
                ) : null}
                {label}
              </span>
            ))}
          </MonoLabel>
        </div>

        <DisplayHeading
          as="h1"
          step="d1"
          lines={hero.headlineLines}
          className={styles.headline}
          immediate
        />

        <Reveal className={styles.support} delay={0.6}>
          <p>{hero.support}</p>
        </Reveal>

        <Reveal className={styles.actions} delay={0.78}>
          <ActionLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ActionLink>
          <ActionLink href={hero.secondaryCta.href} variant="secondary">
            {hero.secondaryCta.label}
          </ActionLink>
        </Reveal>

        {/* Technical metadata column. Reads as instrumentation rather than
            decoration: each row states something true about the practice. */}
        <Reveal as="dl" className={styles.meta} delay={0.9} stagger>
          <div className={styles.metaRow}>
            <dt>Focus</dt>
            <dd>Applied AI engineering &amp; research</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Layers</dt>
            <dd>Experience → Agent → Intelligence → Knowledge → Operations → Infrastructure</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Runs on</dt>
            <dd>Cloud, private, on-premises, edge, air-gapped</dd>
          </div>
        </Reveal>
      </div>

      {/* Scroll guidance. A hairline that fills, plus a label — no bouncing arrow,
          and nothing that implies the page will scroll itself. */}
      <div className={styles.guide} aria-hidden="true">
        <span className={styles.guideRail}>
          <span className={styles.guideFill} />
        </span>
        <MonoLabel className={styles.guideLabel}>Scroll</MonoLabel>
      </div>
    </div>
  );
}
