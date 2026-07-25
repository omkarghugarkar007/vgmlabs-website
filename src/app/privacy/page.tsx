import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { LegalDocument } from '@/components/layout/LegalDocument';
import { privacyPolicy } from '@/data/legal';
import { company } from '@/data/company';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: privacyPolicy.summary,
  path: '/privacy',
});

/**
 * Privacy policy.
 *
 * Written to describe what this site actually does: static files, no analytics, no
 * cookies of our own, no server, and a contact form that composes an email in the
 * visitor's own client rather than posting anywhere.
 *
 * If analytics, embedded media, a form service or any third-party script is ever
 * added, the corresponding section in `src/data/legal.ts` must be updated and the
 * effective date bumped.
 */
export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Privacy Policy', path: '/privacy' },
            ]),
          ),
        }}
      />

      <Section density="flush">
        <PageHeader
          kicker="Legal"
          lines={['Privacy Policy']}
          lead={privacyPolicy.summary}
          meta={[
            { label: 'Applies to', value: 'This website and enquiries sent to us' },
            { label: 'Analytics', value: 'None' },
            { label: 'Cookies', value: 'None set by this site' },
            { label: 'Questions', value: company.email },
          ]}
        />
      </Section>

      <Section density="tight" rule>
        <LegalDocument document={privacyPolicy} />
      </Section>
    </>
  );
}
