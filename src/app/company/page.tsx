import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import { ActionLink } from '@/components/ui/ActionLink';
import { FieldScrollDriver } from '@/components/three/FieldScrollDriver';
import { company, companySection, locationLine } from '@/data/company';
import { teamMembers } from '@/data/projects';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import styles from './company.module.scss';

export const metadata: Metadata = pageMetadata({
  title: 'Company',
  description:
    'VGM Labs is an applied-AI company turning advanced research and emerging AI architectures into dependable software systems.',
  path: '/company',
});

/**
 * Company.
 *
 * Deliberately short. There is no origin story, no manifesto and no team grid,
 * because none of those can be written honestly yet — `teamMembers` is empty and
 * the section that would render it is gated on that.
 *
 * What the page does contain is checkable: what the company does, how it works, the
 * registered entity behind it, and how to reach it.
 */
export default function CompanyPage() {
  const hasTeam = teamMembers.length > 0;

  return (
    <>
      <FieldScrollDriver />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Company', path: '/company' },
            ]),
          ),
        }}
      />

      <Section density="flush">
        <PageHeader
          kicker="Company"
          lines={companySection.headlineLines}
          lead={companySection.body}
          meta={[
            { label: 'Entity', value: company.legalName },
            { label: 'Registered', value: locationLine },
            { label: 'Incorporated', value: String(company.foundedYear) },
            { label: 'Contact', value: company.email },
          ]}
        />
      </Section>

      <Section fieldState="agentic" density="default" rule aria-labelledby="what-heading">
        <div className={styles.statementGrid}>
          <div className={styles.statementHead}>
            <MonoLabel marker className={styles.eyebrow}>
              What we do
            </MonoLabel>
            <DisplayHeading
              as="h2"
              step="d3"
              lines={['Models are', 'a component.']}
              id="what-heading"
            />
          </div>

          <div className={styles.statementBody}>
            <Reveal>
              <p className={styles.lead}>{companySection.support}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className={styles.body}>
                In practice that means most of our work is not model work. It is the
                orchestration around the model, the retrieval that grounds it, the
                evaluation that tells us whether a change helped, the permissions that
                bound what it can do, and the deployment engineering that makes it run
                where the data actually lives.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className={styles.body}>
                We work on problems where conventional software has run out of road —
                where the input is unstructured, the process needs judgement, or the
                environment rules out sending data to a hosted API. Where a
                deterministic system would do the job better, we say so.
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section fieldState="production" density="default" rule aria-labelledby="how-heading">
        <div className={styles.principlesHead}>
          <MonoLabel marker className={styles.eyebrow}>
            How we work
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d3"
            lines={['Four commitments.']}
            id="how-heading"
          />
          <p className={styles.principlesNote}>
            These describe how work is run, not what has been achieved. Each one is
            specific enough to hold us to.
          </p>
        </div>

        <dl className={styles.principles}>
          {companySection.principles.map((principle, i) => (
            <div key={principle.id} className={styles.principle}>
              <dt>
                <span className={styles.principleIndex} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {principle.label}
              </dt>
              <dd>{principle.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Team — rendered only when `teamMembers` contains real entries. */}
      {hasTeam ? (
        <Section density="default" rule aria-labelledby="team-heading">
          <div className={styles.principlesHead}>
            <MonoLabel marker className={styles.eyebrow}>
              Team
            </MonoLabel>
            <DisplayHeading as="h2" step="d3" lines={['Who does the work.']} id="team-heading" />
          </div>

          <ul className={styles.team}>
            {teamMembers.map((member) => (
              <li key={member.id} className={styles.member}>
                <h3 className={styles.memberName}>{member.name}</h3>
                <MonoLabel className={styles.memberRole}>{member.role}</MonoLabel>
                <p className={styles.memberFocus}>{member.focus}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Registered details. Kept off the marketing homepage and stated plainly
          here: entity, locality, CIN and contact — nothing more. */}
      <Section density="tight" rule aria-labelledby="details-heading">
        <div className={styles.detailsWrap}>
          <MonoLabel as="h2" id="details-heading" className={styles.detailsHeading}>
            Registered details
          </MonoLabel>

          <dl className={styles.details}>
            <div>
              <dt>Legal entity</dt>
              <dd>{company.legalName}</dd>
            </div>
            <div>
              <dt>Corporate Identity Number</dt>
              <dd className={styles.mono}>{company.cin}</dd>
            </div>
            <div>
              <dt>Registered office</dt>
              <dd>{locationLine}</dd>
            </div>
            <div>
              <dt>Enquiries</dt>
              <dd>
                <a href={`mailto:${company.email}`} className={styles.link}>
                  {company.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section density="default" rule>
        <div className={styles.outro}>
          <p className={styles.outroText}>
            The most useful first message describes the workflow, not the technology.
          </p>
          <ActionLink href="/contact">Start a conversation</ActionLink>
        </div>
      </Section>
    </>
  );
}
