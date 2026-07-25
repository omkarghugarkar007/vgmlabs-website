# Adding work: case studies and demonstrations

Work items live in `src/data/projects.ts`. There are two kinds, and the distinction is
load-bearing:

| `kind` | Meaning | Requires |
| --- | --- | --- |
| `demonstration` | Something VGM Labs built itself, to establish a technical capability | That it exists and the description is accurate |
| `case-study` | A client engagement | Verified outcomes **and** written client approval |

Both are gated on `publish`. The Selected Work section reads `publishedWork`, which is
filtered at the data layer:

```ts
export const publishedWork: readonly WorkItem[] = workItems.filter((item) => item.publish);
```

**Every item in the file is currently `publish: false`**, so the section renders its
empty state — "Selected work currently being documented", followed by the areas being
written up, drawn from the same array so the two cannot drift apart.

That empty state is a deliberate choice, not a gap. Four accurate sentences about what
is in progress is a better signal to a technical buyer than four case studies that
cannot survive a follow-up question.

---

## Publishing a demonstration

The four templates in the file describe builds in the areas VGM Labs works in. To
publish one:

1. **Confirm it exists** and does what the entry says. If the description has drifted
   from the build, fix the description.
2. Check `establishes` — these are the technical claims, and they are the part a
   reader will probe:

   ```ts
   establishes: [
     'Task state survives process restarts and can be replayed for inspection',
     'Each tool call is individually authorised and traced with its arguments',
     'The loop terminates on step, time and token budgets rather than on success alone',
   ],
   ```

   Each must be a property you could demonstrate on request. No business metrics, no
   percentages, no time savings.
3. Verify `stack` and `deployment` match reality.
4. Set `publish: true`.
5. `npm run build && npm run preview`, and read the rendered section as a sceptic.

Optional `href`: only set it if the target resolves. Under `output: 'export'` you must
add `src/app/work/<slug>/page.tsx` and a `sitemap.ts` entry for an internal link to
exist.

---

## Publishing a case study

Higher bar, and worth being slow about.

**Before writing anything, get written client approval** for: being named, the
description of the problem, and every claim about the outcome. Email confirmation from
someone authorised to give it. Keep it.

```ts
{
  id: 'client-slug-project',
  kind: 'case-study',
  publish: true,
  client: 'Client Name',              // only with written approval
  title: 'What was built',
  discipline: 'Document intelligence',
  summary: 'What the system does, in terms the client would recognise.',
  establishes: [
    'Verified, client-approved statements about what the system does',
  ],
  stack: ['Named technologies actually used'],
  deployment: 'On-premises',
}
```

### Checklist

- [ ] Written client approval for the name, the description and every claim
- [ ] Every number independently verifiable, with the measurement method recorded
      internally
- [ ] No confidential data, internal system names, architecture details the client
      would not want public, or personal data
- [ ] Nothing implied about scope beyond what was delivered
- [ ] `kind: 'case-study'` and `client` set — the badge renders differently, and
      conflating a demonstration with a client project is the exact misrepresentation
      this file structure exists to prevent
- [ ] Reviewed by whoever led the engagement

### If the client will not be named

Set `kind: 'case-study'` and omit `client`. Describe them by sector and scale
("a regulated financial services operator in South Asia"), never in a way that makes
them identifiable by elimination. Do not invent a pseudonym that reads as a real
company.

---

## What must never appear

- Client names without written approval
- Invented clients, projects, sectors or logos
- Fabricated metrics, percentages, time savings or cost reductions
- Fake product screenshots or mocked-up dashboards
- Testimonials or quotes that were not given
- Outcomes attributed to VGM Labs that were achieved by someone else
- A demonstration presented as a client engagement

The type system stops some of this — you cannot set `client` on a demonstration
without noticing — but most of it is a judgement call. When unsure, leave
`publish: false`. The empty state is already designed and already honest.
