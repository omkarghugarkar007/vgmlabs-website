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
          lead="This is a record of what we are investigating. Each theme states an open question and the reasoning behind our interest in it — the problems we think are worth solving, and how we are approaching them."
          meta={[
            // The "Published" row is conditional, and deliberately so.
            //
            // It used to render "None yet" whenever nothing was published, which
            // put the word "None" in a metadata row at the top of the page — a
            // stat whose only content was an absence. A row that can only ever
            // say "nothing" is not information; it is an announcement. When there
            // is something to count, the count is worth showing, so the row
            // appears then and not before.
            { label: 'Open questions', value: String(researchThemes.length).padStart(2, '0') },
            ...(publishedResearch.length > 0
              ? [
                  {
                    label: 'Write-ups',
                    value: String(publishedResearch.length).padStart(2, '0'),
                  },
                ]
              : []),
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
