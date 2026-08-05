import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import { ActionLink } from '@/components/ui/ActionLink';
import { FieldScrollDriver } from '@/components/three/FieldScrollDriver';
import { systemLayers } from '@/data/layers';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import styles from './capabilities.module.scss';

export const metadata: Metadata = pageMetadata({
  title: 'Capabilities',
  description:
    'The six layers VGM Labs designs across: experience, agent, intelligence, knowledge, operations and infrastructure — with the architecture considerations and failure modes of each.',
  path: '/capabilities',
});

/**
 * Capabilities.
 *
 * Organised as the six layers of a working intelligent system. Each layer gets the
 * same structure — purpose, technologies, architecture considerations, problems it
 * solves, failure modes, and how reliability is approached — because that
 * repetition is the argument: this is a checklist the company actually applies, not
 * a marketing taxonomy.
 *
 * Failure modes are given equal weight to capabilities. A vendor who can name how
 * their own systems break is easier to trust than one who cannot.
 */
/**
 * One collapsible subsection of a layer.
 *
 * Native `<details>`: it works before hydration, is keyboard-operable and
 * screen-reader-announced without any ARIA, and the collapsed content stays in the
 * DOM so crawlers still index it.
 *
 * `count` is optional and, when given, must be non-zero for anything to render. A
 * subsection with nothing in it would otherwise print its own heading next to a
 * "0" — a label advertising that we have nothing to say under it. Every layer has
 * entries in all five today; this makes it impossible for a data edit to change
 * that quietly.
 */
function Disclosure({
  label,
  count,
  tone,
  open = false,
  children,
}: {
  label: string;
  count?: number;
  tone?: 'warn' | 'ok';
  open?: boolean;
  children: React.ReactNode;
}) {
  if (count === 0) return null;

  const labelClass =
    tone === 'warn'
      ? styles.summaryLabelWarn
      : tone === 'ok'
        ? styles.summaryLabelOk
        : styles.summaryLabel;

  return (
    <details className={styles.disclosure} open={open}>
      <summary className={styles.summary}>
        <MonoLabel className={labelClass}>{label}</MonoLabel>
        {count !== undefined ? (
          <span className={styles.summaryCount} aria-hidden="true">
            {count}
          </span>
        ) : null}
        <span className={styles.summaryMark} aria-hidden="true" />
      </summary>
      <div className={styles.disclosureBody}>{children}</div>
    </details>
  );
}

export default function CapabilitiesPage() {
  return (
    <>
      <FieldScrollDriver />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Capabilities', path: '/capabilities' },
            ]),
          ),
        }}
      />

      <Section density="flush">
        <PageHeader
          kicker="Capabilities"
          lines={['Six layers,', 'one system.']}
          lead="An intelligent product is not a model with an interface. It is six layers that have to agree with each other — and most production difficulty lives at the boundaries between them."
          meta={[
            { label: 'Layers', value: '06' },
            { label: 'Covering', value: 'Purpose, technologies, architecture, failure modes' },
            { label: 'Written for', value: 'Engineering and technical decision-makers' },
          ]}
        >
          {/* Contents. Anchors let a reader jump to the layer they came for. */}
          <nav className={styles.contents} aria-label="Layers">
            <ol>
              {systemLayers.map((layer) => (
                <li key={layer.id}>
                  <a href={`#${layer.id}`} className={styles.contentsLink}>
                    <span className={styles.contentsIndex}>{layer.index}</span>
                    <span className={styles.contentsLabel}>{layer.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </PageHeader>
      </Section>

      {/* Sticky layer navigator.

          Six layers over what used to be about nineteen screens meant that once
          you were inside layer four you had no idea where you were or how much
          was left, and getting to a different layer meant scrolling through
          everything between. This stays under the header for the whole run of
          layers. */}
      <div className={styles.layers}>
        <nav className={styles.rail} aria-label="Layers">
          <ol>
            {systemLayers.map((layer) => (
              <li key={layer.id}>
                <a href={`#${layer.id}`} className={styles.railLink}>
                  <span className={styles.railIndex}>{layer.index}</span>
                  <span className={styles.railLabel}>{layer.title.replace(' Layer', '')}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {systemLayers.map((layer) => (
          <Section
            key={layer.id}
            id={layer.id}
            fieldState={layer.fieldState}
            density="tight"
            rule
            aria-labelledby={`${layer.id}-heading`}
          >
            <article className={styles.layer}>
              <div className={styles.layerHead}>
                <div className={styles.layerTitleRow}>
                  <span className={styles.layerIndex} aria-hidden="true">
                    {layer.index}
                  </span>
                  <h2 id={`${layer.id}-heading`} className={styles.layerTitle}>
                    {layer.title}
                  </h2>
                </div>
                <p className={styles.layerSummary}>{layer.summary}</p>
              </div>

              {/* Always visible: the two-line summary above and this paragraph.
                  If a reader takes only one thing from a layer, it is this. */}
              <Reveal>
                <p className={styles.purpose}>{layer.purpose}</p>
              </Reveal>

              {/* The five repeated subsections, behind progressive disclosure.

                  Every layer repeated the same five headings in full, which is
                  rigorous and also punishing: most readers skimmed nineteen
                  screens and retained nothing. Nothing has been cut — it is one
                  click away, and the headings still say what is there, including
                  the failure modes.

                  Native <details> rather than a JS accordion: it works before
                  hydration, is keyboard-operable and screen-reader-announced
                  without any ARIA, and the collapsed content stays in the DOM so
                  crawlers still index it. Architecture is open by default because
                  it is the subsection that most often answers the question the
                  reader arrived with. */}
              <div className={styles.disclosures}>
                <Disclosure
                  label="Architecture considerations"
                  count={layer.architecture.length}
                  open
                >
                  <ol className={styles.numbered}>
                    {layer.architecture.map((item, index) => (
                      <li key={item}>
                        <span className={styles.numberedIndex} aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </Disclosure>

                <Disclosure
                  label="Failure modes"
                  count={layer.failureModes.length}
                  tone="warn"
                >
                  <ul className={styles.failures}>
                    {layer.failureModes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Disclosure>

                <Disclosure label="How we approach reliability" tone="ok">
                  <p className={styles.reliabilityText}>{layer.reliability}</p>
                </Disclosure>

                <Disclosure
                  label="Representative technologies"
                  count={layer.technologies.length}
                >
                  <ul className={styles.tags}>
                    {layer.technologies.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>
                </Disclosure>

                <Disclosure label="Typical problems solved" count={layer.problems.length}>
                  <ul className={styles.problems}>
                    {layer.problems.map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                  </ul>
                </Disclosure>
              </div>
            </article>
          </Section>
        ))}
      </div>

      <Section density="default" rule>
        <div className={styles.outro}>
          <p className={styles.outroText}>
            Most engagements do not need work in all six layers. The useful first
            conversation is about which layer the actual constraint sits in.
          </p>
          <ActionLink href="/contact">Start a conversation</ActionLink>
        </div>
      </Section>
    </>
  );
}
