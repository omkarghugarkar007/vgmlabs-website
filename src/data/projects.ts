import type { TeamMember, WorkItem } from '@/types/content';

/**
 * Work items.
 *
 * IMPORTANT — this file deliberately publishes nothing.
 *
 * Every entry below is `publish: false`, so the Selected Work section renders its
 * documented empty state ("Selected work currently being documented") rather than
 * asserting builds that have not been completed and written up. The entries are
 * real templates: fill one in and set `publish: true` to make it appear.
 *
 * Rules:
 *   - `kind: 'demonstration'` — an internal build by VGM Labs. Publish once it
 *     exists and the description matches what it actually does.
 *   - `kind: 'case-study'` — a client engagement. Requires verified outcomes and
 *     written client approval before `publish: true`.
 *   - `establishes` describes technical capability. Never put a business metric,
 *     percentage or time saving here unless it is independently verifiable.
 *
 * See `docs/CASE-STUDIES.md` for the full checklist.
 */
export const workItems: readonly WorkItem[] = [
  {
    id: 'multi-agent-workflow-prototype',
    kind: 'demonstration',
    publish: false,
    title: 'Multi-agent workflow prototype',
    discipline: 'Agentic orchestration',
    summary:
      'A bounded planner/executor/critic loop running a multi-step operational process, with typed tools, persisted plan state and an escalation path to a human reviewer.',
    establishes: [
      'Task state survives process restarts and can be replayed for inspection',
      'Each tool call is individually authorised and traced with its arguments',
      'The loop terminates on step, time and token budgets rather than on success alone',
    ],
    stack: ['TypeScript', 'Durable execution', 'Structured tool schemas', 'Trace store'],
    deployment: 'Cloud / private cloud',
  },
  {
    id: 'edge-inference-demonstration',
    kind: 'demonstration',
    publish: false,
    title: 'Edge inference demonstration',
    discipline: 'On-device inference',
    summary:
      'A quantised small language model plus a vision model running entirely on constrained hardware, with local queueing and deferred synchronisation when connectivity returns.',
    establishes: [
      'The system continues to function with the network physically removed',
      'Quality change from quantisation is measured on a task-specific evaluation set',
      'Sustained-load behaviour, including thermal throttling, is characterised',
    ],
    stack: ['On-device runtime', 'Quantised weights', 'Local vector store', 'Deferred sync'],
    deployment: 'Edge device',
  },
  {
    id: 'neuro-symbolic-reasoning-experiment',
    kind: 'demonstration',
    publish: false,
    title: 'Neuro-symbolic reasoning experiment',
    discipline: 'Constrained reasoning',
    summary:
      'A model formalises a natural-language problem into an explicit constraint representation; a deterministic solver produces the answer, and a verifier rejects any solution that violates a stated rule.',
    establishes: [
      'Answers are checkable against declared constraints rather than accepted on fluency',
      'Rules live as reviewable data with an owner, not inside a prompt',
      'Failures separate cleanly into interpretation errors and solver infeasibility',
    ],
    stack: ['Constraint solver', 'Schema-constrained generation', 'Deterministic verifier'],
    deployment: 'Cloud / on-premises',
  },
  {
    id: 'document-intelligence-system',
    kind: 'demonstration',
    publish: false,
    title: 'Document intelligence system',
    discipline: 'Structured extraction',
    summary:
      'Layout-aware parsing and field extraction across scanned and digital documents, with schema validation and confidence-based routing to human review.',
    establishes: [
      'Extracted records are schema-valid and attributable to a page region',
      'Low-confidence fields route to review instead of entering the record silently',
      'Table structure survives extraction, including headers spanning pages',
    ],
    stack: ['Layout analysis', 'OCR', 'Schema validation', 'Review interface'],
    deployment: 'Private cloud / on-premises',
  },
];

/** Only publishable items. The single accessor components should use. */
export const publishedWork: readonly WorkItem[] = workItems.filter((item) => item.publish);

export const workSection = {
  headlineLines: ['Selected work.'] as const,
  /** Shown when `publishedWork` is empty. Honest, and deliberately composed. */
  emptyState: {
    statement: 'Selected work currently being documented.',
    body: 'Rather than publish approximations, this section stays empty until each build can be described accurately — what it does, what it establishes technically, and where it runs. Areas currently being written up:',
    /** Derived from `workItems` so the two never drift apart. */
    pending: workItems.map((item) => ({
      id: item.id,
      title: item.title,
      discipline: item.discipline,
    })),
    note: 'Client engagements appear only as verified case studies, with the client’s approval.',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Team                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Team members.
 *
 * Empty on purpose. The company section renders its team block only when this
 * array has entries — there are no placeholder people, invented biographies or
 * stock portraits anywhere in this project.
 *
 * To add the team, append real entries. The layout adapts from one to many.
 */
export const teamMembers: readonly TeamMember[] = [];
