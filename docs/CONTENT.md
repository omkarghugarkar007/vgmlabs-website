# Editing company content

Every editable string on the site lives in `src/data/`. Components take data as props
and contain no marketing copy, so you can change wording without touching layout,
motion or WebGL code.

All data files are typed against `src/types/content.ts`. If an edit breaks a type,
`npm run typecheck` will say exactly what and where — that is the safety net, so run
it after editing.

```bash
npm run typecheck     # catches structural mistakes
npm run dev           # see the change
```

---

## Where each thing lives

| File | Controls |
| --- | --- |
| `src/data/company.ts` | Brand, legal entity, address, CIN, email, hero, positioning, company statement, final CTA |
| `src/data/navigation.ts` | Nav items, footer columns, homepage anchors |
| `src/data/capabilities.ts` | The seven-stage architecture rail, four homepage capability chapters, eighteen-entry capability index |
| `src/data/layers.ts` | The six system layers on the Capabilities page |
| `src/data/approach.ts` | Five process steps, thirteen approach topics, the nine production requirements |
| `src/data/deployments.ts` | The five deployment environments and their characteristics |
| `src/data/research.ts` | Research categories, open questions, publishable entries |
| `src/data/projects.ts` | Work items (case studies and demonstrations) and the team list |
| `src/data/legal.ts` | Privacy policy and terms of use |

---

## Common edits

### Change the email address

`src/data/company.ts` → `company.email`. It propagates to the footer, contact page,
final CTA, legal documents and the JSON-LD contact point.

The contact form's recipient is separate, because it can be overridden per
deployment: set `NEXT_PUBLIC_CONTACT_EMAIL`, or leave it unset to fall back to the
address hard-coded in `src/lib/contact/transport.ts`. Change both if the address
changes permanently.

### Change a headline

Display headlines are authored as **arrays of lines**, not sentences:

```ts
headlineLines: ['Intelligence,', 'engineered for', 'the real world.'] as const,
```

This is deliberate. Line breaks in display type are a typographic decision, and the
reveal animation runs per line — if the browser chose the breaks, the animation would
re-stagger on every resize. Keep lines roughly balanced and under about 20 characters
for `d1`, 24 for `d2`.

### Add or reorder a capability chapter

`src/data/capabilities.ts` → `capabilityChapters`. Each chapter needs a `fieldState`,
which is what makes the 3D field reorganise when that chapter scrolls into view.
Valid values: `core`, `agentic`, `distributed`, `symbolic`, `production`.

`index` is authored rather than derived, so reordering the array does not silently
renumber the chapters — update both.

### Add an entry to the capability index

`src/data/capabilities.ts` → `capabilityMatrix`. Every entry needs:

- `ref` — a stable reference code (`C-19`, `C-20`, …)
- `summary` — what the work actually is
- `disciplines` — the technical fields it draws on
- `outcome` — **a capability, never a performance claim.**
  "Answers traceable to a source document the user is permitted to read" is fine.
  "40% faster retrieval" is not, unless it is independently verifiable and you are
  prepared to be asked how it was measured.

The layout is a two-column index that adapts to any number of entries.

### Edit a system layer

`src/data/layers.ts`. Each layer has a fixed shape: `purpose`, `technologies`,
`architecture`, `problems`, `failureModes`, `reliability`.

`failureModes` is not optional, and it is not a place to be vague. Naming how your
own systems break is the most credible thing on the page — keep entries concrete
("Chunk boundaries that split a table from its header") rather than abstract
("data quality issues").

`technologies` should list categories and open standards. Avoid naming commercial
products unless they are genuinely ubiquitous, because a product list dates quickly
and reads as an endorsement.

### Change the deployment environments

`src/data/deployments.ts`. `traits` are **qualitative descriptions of the
environment**, never numbers and never claims about work delivered. Keep
`deploymentSection.scopeNote` — it is what stops the section implying five completed
engagements.

`position` is in scene units and feeds the projected network diagram; `links`
defines the edges. Declare each link from both sides (the diagram de-duplicates).

### Show the team

`src/data/projects.ts` → `teamMembers` is an empty array, and both the homepage
company section and the Company page hide their team blocks while it stays empty.
There are no placeholder people anywhere in this project by design.

To add real entries:

```ts
export const teamMembers: readonly TeamMember[] = [
  {
    id: 'firstname-lastname',
    name: 'Full Name',
    role: 'Role title',
    focus: 'One line on what they actually work on.',
    links: [{ label: 'GitHub', href: 'https://github.com/…' }],
  },
];
```

The layout adapts from one member to many. `image` is optional — omit it rather than
using a placeholder. If you add images, put them in `public/team/` and note that
`next/image` optimisation is unavailable under static export, so export them at the
size they will be displayed (2× for retina) and keep them under ~120 KB.

### Edit the legal pages

`src/data/legal.ts`. Two documents, each an array of sections with `paragraphs`
and/or `bullets`.

**Update `effectiveDate` whenever the text changes.** It is displayed on the page.

The current privacy policy describes what this site actually does: static files, no
analytics, no cookies of our own, no server, and a contact form that composes an
email in the visitor's own client. **If you add analytics, embedded media, a form
service, or any third-party script, the "Information we collect", "Cookies" and
"Sharing and processors" sections must be updated to disclose it.** These documents
are drafted in good faith but are not legal advice — have them reviewed.

---

## Content rules

The site's credibility depends on these. They are worth re-reading before publishing
an edit.

**Do not add:**

- customers, client names or logos
- revenue, funding, valuation or growth figures
- team size, headcount or years of experience
- deployment counts ("deployed at 50 sites")
- benchmark scores or model comparisons you have not reproduced
- partnerships, certifications, awards or accreditations
- testimonials or quotes
- case-study outcomes that are not verified and approved

**Language:**

| Instead of | Write |
| --- | --- |
| "Revolutionising AI" | what the system does |
| "Cutting-edge solutions" | the specific architecture |
| "Guaranteed accuracy" | "measured against a task-specific evaluation set" |
| "Industry-leading" | nothing; delete the sentence |
| "Transform your business" | the workflow, decision or constraint addressed |

British spelling throughout (`optimisation`, `organisation`, `analyse`) for
consistency with the existing copy.

Prefer sentences a sceptical engineer could check. If a claim cannot be defended when
someone asks "how do you know?", it does not belong on the site.
