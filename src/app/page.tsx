import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { CapabilityChapters } from '@/components/sections/CapabilityChapters';
import { CapabilityMatrix } from '@/components/sections/CapabilityMatrix';
import { CompanyStatement } from '@/components/sections/CompanyStatement';
import { DeploymentEnvironments } from '@/components/sections/deployment/DeploymentEnvironments';
import { EngineeringApproach } from '@/components/sections/EngineeringApproach';
import { FinalCta } from '@/components/sections/FinalCta';
import { Hero } from '@/components/sections/Hero';
import { Positioning } from '@/components/sections/Positioning';
import { ResearchIndex } from '@/components/sections/ResearchIndex';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { FieldScrollDriver } from '@/components/three/FieldScrollDriver';
import { shortDescription } from '@/data/company';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'VGM Labs — Agentic, Edge and Neuro-Symbolic AI Systems',
  description: shortDescription,
  path: '/',
});

/**
 * Homepage.
 *
 * A server component: all copy is rendered into the exported HTML, and only the
 * interactive leaves (the field, the scroll drivers, the matrix disclosures) are
 * client components.
 *
 * `fieldState` on each section drives the Intelligence Field. The order is the
 * narrative — core assembling, agents separating, clusters distributing, geometry
 * meeting organic flow, the system stabilising — and section `density` is varied
 * deliberately so the page has a rhythm rather than a uniform beat.
 *
 * The capability chapters set their own field states per chapter, so that section
 * intentionally carries none of its own.
 */
export default function HomePage() {
  return (
    <>
      <FieldScrollDriver />

      <Section fieldState="core" density="flush">
        <Hero />
      </Section>

      <Section
        id="positioning"
        fieldState="core"
        density="loose"
        rule
        aria-labelledby="positioning-heading"
      >
        <Positioning />
      </Section>

      <Section id="capabilities" density="default" aria-labelledby="capabilities-heading">
        <CapabilityChapters />
      </Section>

      <Section
        id="matrix"
        fieldState="production"
        density="default"
        rule
        aria-labelledby="matrix-heading"
      >
        <CapabilityMatrix />
      </Section>

      <Section
        id="approach"
        fieldState="symbolic"
        density="loose"
        rule
        aria-labelledby="approach-heading"
      >
        <EngineeringApproach />
      </Section>

      <Section
        id="deployment"
        fieldState="distributed"
        density="default"
        rule
        aria-labelledby="deployment-heading"
      >
        <DeploymentEnvironments />
      </Section>

      <Section
        id="research"
        fieldState="symbolic"
        density="default"
        rule
        aria-labelledby="research-heading"
      >
        <ResearchIndex />
      </Section>

      <Section id="work" fieldState="production" density="tight" rule aria-labelledby="work-heading">
        <SelectedWork />
      </Section>

      <Section
        id="company"
        fieldState="agentic"
        density="loose"
        rule
        aria-labelledby="company-heading"
      >
        <CompanyStatement />
      </Section>

      <Section fieldState="production" density="loose" rule aria-labelledby="cta-heading">
        <FinalCta />
      </Section>
    </>
  );
}
