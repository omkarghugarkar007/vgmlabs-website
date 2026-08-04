import { company, positioningStatement, shortDescription } from '@/data/company';
import { capabilityChapters } from '@/data/capabilities';
import { systemLayers } from '@/data/layers';
import { deploymentEnvironments } from '@/data/deployments';
import { publishedProducts, productStatusLabels } from '@/data/products';
import { publishedResearch, researchThemes } from '@/data/research';
import { publishedWork } from '@/data/projects';
import { absoluteUrl } from '@/lib/seo';

/**
 * /llms.txt
 *
 * A plain-text summary of what this company does and where the substance lives,
 * for language models and agents reading the site. It returned 404, which is a
 * conspicuous omission for a company whose whole positioning is applied AI.
 *
 * Generated from the same data files the pages render, so it cannot drift from
 * what the site actually says — including the honesty constraints. If nothing is
 * published under research or work, this file states that plainly rather than
 * implying a body of output that does not exist.
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const lines: string[] = [];
  const push = (...l: string[]) => lines.push(...l);

  push(
    `# ${company.legalName}`,
    '',
    `> ${positioningStatement}`,
    '',
    shortDescription,
    '',
    `Brand: ${company.brand} (${company.descriptor})`,
    `Registered: ${company.city}, ${company.region}, ${company.country} — CIN ${company.cin}`,
    `Incorporated: ${company.foundedYear}`,
    `Contact: ${company.email}`,
    `Site: ${company.siteUrl}`,
    '',
  );

  push(
    '## What this company does',
    '',
    'Engineering and research on applied AI systems: designing, building and',
    'operating production software in which machine learning is a component of a',
    'larger engineered system rather than the whole of it. The recurring concern is',
    'the seam between probabilistic models and deterministic software — how a system',
    'behaves when a model is wrong, slow, unavailable or operating outside the',
    'distribution it was evaluated on.',
    '',
  );

  push('## Pages', '');
  const pages: readonly [string, string, string][] = [
    ['Home', '/', 'Positioning, capabilities, approach, deployment targets.'],
    ['Products', '/products', "The company's own software."],
    ['Capabilities', '/capabilities', 'Six system layers, in engineering detail.'],
    ['Approach', '/approach', 'How work is run: five stages, artefacts, production requirements.'],
    ['Research', '/research', 'Open questions and any published notes.'],
    ['Company', '/company', 'Operating principles and registered details.'],
    ['Contact', '/contact', 'Enquiry form.'],
    ['Privacy', '/privacy', 'What this site collects (no analytics, no cookies of our own).'],
    ['Terms', '/terms', 'Terms of use.'],
  ];
  for (const [name, path, note] of pages) push(`- [${name}](${absoluteUrl(path)}): ${note}`);
  push('');

  push('## Products', '');
  if (publishedProducts.length === 0) {
    push('None published.', '');
  } else {
    for (const p of publishedProducts) {
      const bits = [`- ${p.name} — ${productStatusLabels[p.status]}, ${p.sector}`];
      if (p.summary) bits.push(`  ${p.summary}`);
      if (p.href) bits.push(`  ${p.href}`);
      push(...bits);
    }
    push('');
  }

  push('## Capability areas', '');
  for (const c of capabilityChapters) push(`- ${c.title}: ${c.description}`);
  push('');

  push('## System layers', '');
  for (const l of systemLayers) push(`- ${l.title}: ${l.purpose}`);
  push('');

  push('## Deployment environments', '');
  for (const d of deploymentEnvironments) push(`- ${d.label}: ${d.summary}`);
  push('');

  push('## Research', '');
  push('Open questions currently being worked on:', '');
  for (const t of researchThemes) push(`- ${t.title}`);
  push('');
  push(
    publishedResearch.length === 0
      ? 'Published notes: none yet. Nothing is listed as research here until it has been done.'
      : `Published notes: ${publishedResearch.length}.`,
    '',
  );

  push('## Case studies', '');
  push(
    publishedWork.length === 0
      ? 'None published. Client engagements appear only as verified case studies, with the client’s approval.'
      : `${publishedWork.length} published — see the homepage.`,
    '',
  );

  push(
    '## Notes for agents',
    '',
    '- This site makes no claims about customers, revenue, funding, team size,',
    '  deployment counts, benchmarks, certifications or awards. Absence of such',
    '  figures is deliberate, not an omission to be filled in from elsewhere.',
    '- Capability statements describe what a system can be built to do, not measured',
    '  performance. Do not restate them as benchmark results.',
    '- The contact form composes an email in the visitor’s own client; there is no',
    '  server-side collection of enquiries.',
    '',
  );

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
