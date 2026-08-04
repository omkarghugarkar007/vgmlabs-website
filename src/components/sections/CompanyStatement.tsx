import Link from 'next/link';
import { companySection } from '@/data/company';
import { teamMembers } from '@/data/projects';
import { homeEyebrow, showWorkChapter } from '@/data/navigation';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import styles from './CompanyStatement.module.scss';

/**
 * Company statement.
 *
 * The team block renders only when `teamMembers` has entries. There are no
 * placeholder people, no invented biographies and no stock portraits anywhere in
 * this project — an absent section is honest, a fabricated one is not.
 *
 * The operating principles are commitments about how work is run, each one
 * specific enough to be held to. They are not claims about what has been achieved.
 */
/**
 * How many operating principles the homepage shows.
 *
 * All four were printed here and then repeated verbatim on /company, so a visitor
 * who read the homepage had nothing to gain by clicking through. Two establishes
 * the kind of commitment these are; the rest, with the note about how they are
 * held to, is on the page someone chose to open.
 */
const TEASER_COUNT = 2;

export function CompanyStatement() {
  const hasTeam = teamMembers.length > 0;

  const shown = companySection.principles.slice(0, TEASER_COUNT);
  const remaining = companySection.principles.length - shown.length;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <MonoLabel marker className={styles.eyebrow}>
          {homeEyebrow('company')}
        </MonoLabel>
        <DisplayHeading
          as="h2"
          step="d2"
          lines={companySection.headlineLines}
          id="company-heading"
        />
      </div>

      <div className={styles.statement}>
        <Reveal>
          <p className={styles.lead}>{companySection.body}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className={styles.support}>{companySection.support}</p>
        </Reveal>
      </div>

      <div className={styles.principles}>
        <div className={styles.principlesHead}>
          <MonoLabel>How we work</MonoLabel>
          <span className={styles.rule} aria-hidden="true" />
        </div>

        <dl className={styles.principleGrid}>
          {shown.map((principle, i) => (
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
      </div>

      {hasTeam ? (
        <div className={styles.team}>
          <div className={styles.principlesHead}>
            <MonoLabel>Team</MonoLabel>
            <span className={styles.rule} aria-hidden="true" />
          </div>

          <ul className={styles.teamList}>
            {teamMembers.map((member) => (
              <li key={member.id} className={styles.member}>
                <h3 className={styles.memberName}>{member.name}</h3>
                <MonoLabel className={styles.memberRole}>{member.role}</MonoLabel>
                <p className={styles.memberFocus}>{member.focus}</p>
                {member.links?.length ? (
                  <ul className={styles.memberLinks}>
                    {member.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href} rel="noopener noreferrer" target="_blank">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* What is left of the Work chapter while nothing is published.
          One line stating the publishing rule, rather than a numbered section
          whose only content was the absence of content. See homeSections in
          src/data/navigation.ts. */}
      {showWorkChapter ? null : (
        <p className={styles.publishingNote}>
          Client engagements are published only as verified case studies, with the
          client’s approval. Nothing appears here before it can be described
          accurately.
        </p>
      )}

      <div className={styles.footer}>
        <Link href="/company" className={styles.footerLink}>
          <span>
            {remaining > 0 ? `${remaining} more commitments, and who we are` : 'About VGM Labs'}
          </span>
          <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M2 7h10M8.5 3.5 12 7l-3.5 3.5" fill="none" stroke="currentColor" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
