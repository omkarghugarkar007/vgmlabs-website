import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { LegalDocument } from '@/components/layout/LegalDocument';
import { termsOfUse } from '@/data/legal';
import { company } from '@/data/company';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Use',
  description: termsOfUse.summary,
  path: '/terms',
});

/**
 * Terms of use.
 *
 * Covers the website only. Engagements are governed by a separate written agreement,
 * and the terms say so explicitly rather than trying to serve both purposes.
 */
export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Terms of Use', path: '/terms' },
            ]),
          ),
        }}
      />

      <Section density="flush">
        <PageHeader
          kicker="Legal"
          lines={['Terms of Use']}
          lead={termsOfUse.summary}
          meta={[
            { label: 'Covers', value: 'This website only' },
            { label: 'Engagements', value: 'Governed by a separate written agreement' },
            { label: 'Governing law', value: `${company.country}` },
            { label: 'Questions', value: company.email },
          ]}
        />
      </Section>

      <Section density="tight" rule>
        <LegalDocument document={termsOfUse} />
      </Section>
    </>
  );
}
