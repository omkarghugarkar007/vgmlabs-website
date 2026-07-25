# Adding research

Research content lives in `src/data/research.ts` and comes in two distinct kinds.
Keeping them separate is what lets the page be honest about what has and has not been
done.

| Kind | What it is | Rendered? |
| --- | --- | --- |
| `researchThemes` | An open question the company is investigating | Always |
| `researchEntries` | A finished write-up, note or technical report | Only when `publish: true` **and** `status: 'published'` |

A theme claims nothing except interest, so it needs no verification. An entry claims
that work was done, so it is gated.

---

## The publishing gate

```ts
// src/data/research.ts
export const publishedResearch: readonly ResearchEntry[] = researchEntries.filter(
  (entry) => entry.publish && entry.status === 'published',
);
```

The Research page and the homepage index read `publishedResearch`, never
`researchEntries`. The filter is at the **data layer**, not in a component, so an
unfinished entry cannot reach the page even if someone edits the rendering code.

Both conditions must hold. `status` describes where the writing is; `publish` is the
explicit decision to make it public. Requiring both means bumping a draft's status
during editing does not accidentally publish it.

The three entries currently in the file are `publish: false` templates. They render
nowhere and exist to show the required shape.

---

## Adding a real entry

1. **Write the thing first.** The entry is a pointer to a document that exists.

2. Add it to `researchEntries`:

```ts
{
  id: 'termination-criteria-bounded-agent-loops',
  title: 'Termination criteria for bounded agent loops',
  category: 'agentic',
  status: 'published',
  publish: true,
  date: '2026-08-14',              // ISO 8601, the date it was published
  summary:
    'Two sentences on what the note examines and what it concludes. Written for '
    + 'someone deciding whether to read it.',
  authors: ['Full Name'],           // optional; real names only
  href: '/research/termination-criteria', // or an external URL
  readingTimeMinutes: 9,            // optional
}
```

3. Make `href` resolve. It is not created for you:
   - **Internal** — add `src/app/research/<slug>/page.tsx`, then add the route to
     `src/app/sitemap.ts`. Under `output: 'export'` a route only exists if there is a
     page file for it.
   - **External** — a full `https://` URL. It opens in the same tab; change the
     component if you want otherwise.

4. `npm run typecheck && npm run build`, then check the entry appears under the right
   category filter and that the link works in `npm run preview`.

`category` must be one of the `ResearchCategoryId` values: `agentic`,
`neuro-symbolic`, `edge`, `efficient-inference`, `evaluation`, `multimodal`. To add a
category, extend both `ResearchCategoryId` in `src/types/content.ts` and
`researchCategories` — the filter row and its counts derive from that array.

---

## Adding a theme

Lower bar, because a theme is a question rather than a result:

```ts
{
  id: 'kebab-case-id',
  ref: 'R-09',                     // sequential, stable
  title: 'Short noun phrase',
  category: 'edge',
  question: 'The actual open question, phrased as a question.',
  detail: 'Two or three sentences on why it matters and what specifically '
        + 'interests us — the sub-problem, not the field.',
}
```

Write `question` as a genuine question. "How does a system maintain a coherent
objective across dozens of dependent steps without accumulating error?" invites a
conversation; "Advanced agentic reasoning research" says nothing.

---

## What must not appear here

Non-negotiable, because these are the claims most likely to be checked:

- **Papers that do not exist.** No invented citations, venues, arXiv IDs or DOIs.
- **Patents.** Not "patent pending" unless an application has actually been filed,
  with a number you can produce.
- **Awards, grants or recognition** that were not received.
- **Institutional partnerships or affiliations** that are not in place. Naming a
  university or lab you have not partnered with is a misrepresentation, not marketing.
- **Benchmark scores you have not reproduced yourself**, on hardware you can name,
  with a method you can describe. If a figure appears in an entry, the entry must
  state the models, hardware, quantization method, task and evaluation set used.
- **Author names** of people who did not write it.

If you are unsure whether something can be published, leave `publish: false`. The page
handles the empty case deliberately — it says nothing is published in that area yet,
which costs nothing. A claim that does not survive scrutiny costs considerably more.
