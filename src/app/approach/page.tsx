import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import { ActionLink } from '@/components/ui/ActionLink';
import { FieldScrollDriver } from '@/components/three/FieldScrollDriver';
import {
  approachTopics,
  engagementStart,
  failureSection,
  processSteps,
  productionRequirements,
} from '@/data/approach';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import styles from './approach.module.scss';

export const metadata: Metadata = pageMetadata({
  title: 'Approach',
  description:
    'How VGM Labs runs applied AI work: problem discovery, feasibility, dataset assessment, architecture and model selection, evaluation, security, deployment and maintenance.',
  path: '/approach',
});

/**
 * Approach.
 *
 * Thirteen topics, each with the questions that stage of work is meant to answer.
 * The questions matter more than the prose: they are what a prospective client can
 * check us against, and they make the process falsifiable rather than reassuring.
 *
 * The "AI systems fail outside the demo" section is framed as engineering
 * discipline, not risk marketing — it names what production requires and stops
 * there, with no implied threat about what happens otherwise.
 */
export default function ApproachPage() {
  return (
    <>
      <FieldScrollDriver />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Approach', path: '/approach' },
            ]),
          ),
        }}
      />

      <Section density="flush">
        <PageHeader
          kicker="Approach"
          lines={['The work between', 'a demo and', 'a system.']}
          lead="A prototype answers whether something is possible. Everything after that is engineering: the surrounding logic, the evaluation, the permissions, the failure paths and the handover. This page describes how that work is actually run."
          meta={[
            { label: 'Stages', value: '05 phases / 13 disciplines' },
            { label: 'Deliverables', value: 'Documentation, evaluations and runbooks ship with the system' },
            { label: 'Includes', value: 'The conclusion "do not build this"' },
          ]}
        />
      </Section>

      {/* Five phases. The homepage carries the scroll-driven version of the same
          sequence; this is where the detail is — what each stage actually
          produces.

          Those artefact lists used to be on the homepage and not here, so this
          page read as a thinner restatement of something the visitor had already
          seen. The depth belongs on the page a reader chose to open. */}
      <Section fieldState="agentic" density="tight" rule>
        <div className={styles.phases}>
          {processSteps.map((step) => (
            <div key={step.id} className={styles.phase}>
              <MonoLabel tone="amber">{step.index}</MonoLabel>
              <h2 className={styles.phaseTitle}>{step.title}</h2>
              <p className={styles.phaseBody}>{step.description}</p>

              <div className={styles.phaseOutputs}>
                <MonoLabel as="h3" className={styles.phaseOutputsLabel}>
                  What it produces
                </MonoLabel>
                <ul>
                  {step.outputs.map((output) => (
                    <li key={output}>{output}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Thirteen topics. */}
      <Section fieldState="symbolic" density="default" rule aria-labelledby="topics-heading">
        <div className={styles.topicsHead}>
          <MonoLabel marker className={styles.eyebrow}>
            Disciplines
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d3"
            lines={['How each decision', 'gets made.']}
            id="topics-heading"
          />
        </div>

        <div className={styles.topics}>
          {approachTopics.map((topic, i) => (
            <article key={topic.id} id={topic.id} className={styles.topic}>
              <div className={styles.topicIndex} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className={styles.topicBody}>
                <h3 className={styles.topicTitle}>{topic.title}</h3>
                <p className={styles.topicText}>{topic.body}</p>
              </div>

              <div className={styles.topicQuestions}>
                <MonoLabel as="h4" className={styles.questionsLabel}>
                  Questions we answer
                </MonoLabel>
                <ul>
                  {topic.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* AI systems fail outside the demo. */}
      <Section
        fieldState="production"
        density="loose"
        rule
        aria-labelledby="failure-heading"
      >
        <div className={styles.failureHead}>
          <MonoLabel marker tone="amber" className={styles.eyebrow}>
            Production discipline
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d2"
            lines={['AI systems fail', 'outside the demo.']}
            id="failure-heading"
          />
          <Reveal>
            <p className={styles.failureIntro}>{failureSection.intro}</p>
          </Reveal>
        </div>

        <ol className={styles.requirements}>
          {productionRequirements.map((requirement, i) => (
            <li key={requirement.id} className={styles.requirement}>
              <span className={styles.requirementIndex} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className={styles.requirementTitle}>{requirement.title}</h3>
                <p className={styles.requirementBody}>{requirement.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className={styles.failureOutro}>{failureSection.outro}</p>
      </Section>

      {/* How an engagement starts. Everything above describes how work is run once
          it begins; this is the part that was missing — how a reader gets from a
          first message to stage 01. See the note in src/data/approach.ts about why
          it states no durations or prices. */}
      <Section
        id="how-to-start"
        fieldState="core"
        density="tight"
        rule
        aria-labelledby="start-heading"
      >
        <div className={styles.startHead}>
          <MonoLabel marker className={styles.eyebrow}>
            Getting started
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d3"
            lines={[engagementStart.heading]}
            id="start-heading"
          />
          <Reveal>
            <p className={styles.startIntro}>{engagementStart.intro}</p>
          </Reveal>
        </div>

        <ol className={styles.startSteps}>
          {engagementStart.steps.map((step) => (
            <li key={step.id} className={styles.startStep}>
              <span className={styles.startIndex} aria-hidden="true">
                {step.index}
              </span>
              <div>
                <h3 className={styles.startTitle}>{step.title}</h3>
                <p className={styles.startDetail}>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section density="tight" rule>
        <div className={styles.outro}>
          <p className={styles.outroText}>
            If you already know which of these is missing from your system, that is the
            conversation to start with.
          </p>
          <ActionLink href="/contact">Start a conversation</ActionLink>
        </div>
      </Section>
    </>
  );
}
