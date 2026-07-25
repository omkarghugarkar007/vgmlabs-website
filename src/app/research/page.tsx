import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { ResearchLibrary } from '@/components/sections/ResearchLibrary';
import { FieldScrollDriver } from '@/components/three/FieldScrollDriver';
import { publishedResearch, researchThemes } from '@/data/research';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Research',
  description:
    'Open questions VGM Labs is investigating across agentic reasoning, neuro-symbolic methods, edge AI, efficient inference, evaluation and multimodal systems.',
  path: '/research',
});

/**
 * Research.
 *
 * A library layout with category filters. The important property of this page is
 * what it does *not* contain: no papers, patents, awards, institutional
 * partnerships or benchmark scores. Publishable entries are gated on `publish` in
 * `src/data/research.ts`, and the current state of that file publishes nothing —
 * so the page shows open questions and an explicit note about the absence.
 *
 * See `docs/RESEARCH.md` for how to add a real entry.
 */
export default function ResearchPage() {
  return (
    <>
      <FieldScrollDriver />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Research', path: '/research' },
            ]),
          ),
        }}
      />

      <Section density="flush">
        <PageHeader
          kicker="Research"
          lines={['Questions we', 'are working on.']}
          lead="This is a record of what we are investigating, not a publication list. Themes describe open questions and the reasoning behind our interest in them. Write-ups appear only once they exist and their claims have been checked."
          meta={[
            { label: 'Themes', value: String(researchThemes.length).padStart(2, '0') },
            {
              label: 'Published',
              value:
                publishedResearch.length > 0
                  ? String(publishedResearch.length).padStart(2, '0')
                  : 'None yet',
            },
            { label: 'Areas', value: 'Agentic, neuro-symbolic, edge, inference, evaluation, multimodal' },
          ]}
        />
      </Section>

      <Section fieldState="symbolic" density="tight" rule>
        <ResearchLibrary />
      </Section>
    </>
  );
}
