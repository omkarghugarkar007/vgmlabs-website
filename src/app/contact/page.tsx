import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { ContactForm } from '@/components/forms/ContactForm';
import { FieldScrollDriver } from '@/components/three/FieldScrollDriver';
import { company, locationLine } from '@/data/company';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import styles from './contact.module.scss';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    `Describe the workflow, decision or technical constraint you are working on. VGM Labs replies from ${company.email}.`,
  path: '/contact',
});

/**
 * Contact.
 *
 * The form is the only interactive part; the surrounding column states plainly what
 * happens to an enquiry and what a useful first message contains. The fallback
 * address is visible before, during and after the form, so the page works even if
 * the form does not.
 */
export default function ContactPage() {
  return (
    <>
      <FieldScrollDriver />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Contact', path: '/contact' },
            ]),
          ),
        }}
      />

      <Section density="flush">
        <PageHeader
          kicker="Contact"
          lines={['Let’s define', 'the actual problem.']}
          lead="Bring the workflow, decision or constraint rather than a solution brief. The first conversation is usually about whether a model is the right instrument at all — and occasionally the answer is that it is not."
          meta={[
            { label: 'Email', value: company.email },
            { label: 'Based in', value: locationLine },
            { label: 'Reply', value: 'Read and answered by the people who build the systems' },
          ]}
        />
      </Section>

      <Section fieldState="core" density="tight" rule>
        <div className={styles.layout}>
          <div className={styles.formColumn}>
            <ContactForm />
          </div>

          <aside className={styles.aside}>
            <div className={styles.asideBlock}>
              <MonoLabel as="h2" className={styles.asideLabel}>
                What helps
              </MonoLabel>
              <ul className={styles.asideList}>
                <li>The process or decision as it works today, including who does it.</li>
                <li>What an unacceptable outcome looks like, and who absorbs it.</li>
                <li>Where the data lives and whether it can leave that boundary.</li>
                <li>Any hard limit already known — latency, cost, connectivity, compliance.</li>
              </ul>
            </div>

            <div className={styles.asideBlock}>
              <MonoLabel as="h2" className={styles.asideLabel}>
                Please don’t send
              </MonoLabel>
              <ul className={styles.asideList}>
                <li>
                  Credentials, API keys or access tokens. We will never ask for them by
                  email.
                </li>
                <li>
                  Confidential or personal data in a first message. Until an agreement is
                  in place we cannot treat it as confidential.
                </li>
              </ul>
            </div>

            <div className={styles.asideBlock}>
              <MonoLabel as="h2" className={styles.asideLabel}>
                Direct
              </MonoLabel>
              <a href={`mailto:${company.email}`} className={styles.email}>
                {company.email}
              </a>
              <p className={styles.asideNote}>
                If a form is not how you prefer to work, plain email is entirely welcome.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
