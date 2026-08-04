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
                <details className={styles.disclosure} open>
                  <summary className={styles.summary}>
                    <MonoLabel className={styles.summaryLabel}>
                      Architecture considerations
                    </MonoLabel>
                    <span className={styles.summaryCount} aria-hidden="true">
                      {layer.architecture.length}
                    </span>
                    <span className={styles.summaryMark} aria-hidden="true" />
                  </summary>
                  <div className={styles.disclosureBody}>
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
                  </div>
                </details>

                <details className={styles.disclosure}>
                  <summary className={styles.summary}>
                    <MonoLabel className={styles.summaryLabelWarn}>Failure modes</MonoLabel>
                    <span className={styles.summaryCount} aria-hidden="true">
                      {layer.failureModes.length}
                    </span>
                    <span className={styles.summaryMark} aria-hidden="true" />
                  </summary>
                  <div className={styles.disclosureBody}>
                    <ul className={styles.failures}>
                      {layer.failureModes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </details>

                <details className={styles.disclosure}>
                  <summary className={styles.summary}>
                    <MonoLabel className={styles.summaryLabelOk}>
                      How we approach reliability
                    </MonoLabel>
                    <span className={styles.summaryMark} aria-hidden="true" />
                  </summary>
                  <div className={styles.disclosureBody}>
                    <p className={styles.reliabilityText}>{layer.reliability}</p>
                  </div>
                </details>

                <details className={styles.disclosure}>
                  <summary className={styles.summary}>
                    <MonoLabel className={styles.summaryLabel}>
                      Representative technologies
                    </MonoLabel>
                    <span className={styles.summaryCount} aria-hidden="true">
                      {layer.technologies.length}
                    </span>
                    <span className={styles.summaryMark} aria-hidden="true" />
                  </summary>
                  <div className={styles.disclosureBody}>
                    <ul className={styles.tags}>
                      {layer.technologies.map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                  </div>
                </details>

                <details className={styles.disclosure}>
                  <summary className={styles.summary}>
                    <MonoLabel className={styles.summaryLabel}>
                      Typical problems solved
                    </MonoLabel>
                    <span className={styles.summaryCount} aria-hidden="true">
                      {layer.problems.length}
                    </span>
                    <span className={styles.summaryMark} aria-hidden="true" />
                  </summary>
                  <div className={styles.disclosureBody}>
                    <ul className={styles.problems}>
                      {layer.problems.map((problem) => (
                        <li key={problem}>{problem}</li>
                      ))}
                    </ul>
                  </div>
                </details>
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
