import type { ResearchCategory, ResearchEntry, ResearchTheme } from '@/types/content';

/**
 * Research content.
 *
 * Two distinct things live here:
 *
 *   `researchThemes`  — open questions the company is interested in. Themes make
 *                       no claim to results, so they are always rendered.
 *   `researchEntries` — publishable write-ups. Every entry is gated on
 *                       `publish: true`, and the page renders only those. The
 *                       placeholders below are `publish: false` and therefore
 *                       invisible on the site; they exist to document the shape
 *                       of a real entry. See `docs/RESEARCH.md`.
 *
 * Nothing here may reference papers, patents, awards, institutional
 * partnerships or benchmark scores that do not exist.
 */

export const researchCategories: readonly ResearchCategory[] = [
  {
    id: 'agentic',
    label: 'Agentic AI',
    description:
      'Control loops, planning, delegation and termination behaviour in systems that act over many steps.',
  },
  {
    id: 'neuro-symbolic',
    label: 'Neuro-symbolic AI',
    description:
      'Combining learned representations with rules, constraints, search and verifiable structure.',
  },
  {
    id: 'edge',
    label: 'Edge AI',
    description:
      'Operating intelligent systems under fixed memory, power, thermal and connectivity limits.',
  },
  {
    id: 'efficient-inference',
    label: 'Efficient Inference',
    description:
      'Reducing the cost of a useful answer through compression, routing, caching and runtime choice.',
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    description:
      'Measuring the behaviour of non-deterministic and autonomous systems in ways that transfer to production.',
  },
  {
    id: 'multimodal',
    label: 'Multimodal Systems',
    description:
      'Grounding across text, images, documents, audio and structured records within one task.',
  },
];

export const researchThemes: readonly ResearchTheme[] = [
  {
    id: 'long-horizon-agentic-reasoning',
    ref: 'R-01',
    title: 'Long-horizon agentic reasoning',
    category: 'agentic',
    question:
      'How does a system maintain a coherent objective across dozens of dependent steps without accumulating error?',
    detail:
      'Interest here is in externalised plan state, checkpointing, and mechanisms that let a system detect that its current approach has stopped working and revise it rather than repeating it.',
  },
  {
    id: 'neuro-symbolic-problem-solving',
    ref: 'R-02',
    title: 'Neuro-symbolic problem solving',
    category: 'neuro-symbolic',
    question:
      'Where is the right boundary between a learned model and an explicit solver for a given class of problem?',
    detail:
      'Practical interest in using models to interpret and formalise a problem, and deterministic search or constraint solving to answer it — so that the answer is checkable rather than merely persuasive.',
  },
  {
    id: 'efficient-model-inference',
    ref: 'R-03',
    title: 'Efficient model inference',
    category: 'efficient-inference',
    question:
      'What is the cheapest configuration that still meets a task’s quality bar on the target hardware?',
    detail:
      'Quantisation and distillation trade quality for footprint unevenly across task types. The question is which capabilities degrade first, and how to detect that on a task-specific evaluation set rather than a general benchmark.',
  },
  {
    id: 'tool-using-language-models',
    ref: 'R-04',
    title: 'Tool-using language models',
    category: 'agentic',
    question:
      'How should tools be described, scoped and validated so that correct selection is the default rather than the exception?',
    detail:
      'Interest in schema design, argument validation, and error messages written for a model reader — treating the tool interface as an ergonomics problem rather than an API afterthought.',
  },
  {
    id: 'evaluation-of-autonomous-systems',
    ref: 'R-05',
    title: 'Evaluation of autonomous systems',
    category: 'evaluation',
    question:
      'How do you evaluate a process rather than a single output, when the same objective admits many valid trajectories?',
    detail:
      'Attention on trajectory-level scoring, partial credit, cost-aware metrics, and the reliability of model-based judges compared with human review on the same set.',
  },
  {
    id: 'multimodal-understanding',
    ref: 'R-06',
    title: 'Multimodal understanding',
    category: 'multimodal',
    question:
      'How is grounding maintained when evidence for one answer is split across a document’s layout, an image and a database record?',
    detail:
      'Interest in cross-modal citation, resolving conflicts between sources of different reliability, and preserving spatial structure through extraction.',
  },
  {
    id: 'small-specialised-models',
    ref: 'R-07',
    title: 'Small and specialised models',
    category: 'edge',
    question:
      'Which production steps are better served by a small task-specific model than a general one?',
    detail:
      'Classification, extraction, routing and reranking are often high-volume and narrow. The question is where a compact model matches a large one on the task while fitting a constrained target.',
  },
  {
    id: 'reliable-structured-generation',
    ref: 'R-08',
    title: 'Reliable structured generation',
    category: 'neuro-symbolic',
    question:
      'How is output made schema-valid and semantically correct, not merely parseable?',
    detail:
      'Constrained decoding solves syntax. The open part is semantic validity — referential integrity, unit consistency, and satisfaction of domain constraints — and where that check belongs in the pipeline.',
  },
];

export const researchSection = {
  headlineLines: ['Building beyond', 'the current default.'] as const,
  body: 'We explore architectures that make intelligent systems more capable, efficient, verifiable and deployable.',
  note: 'These are the questions we are working on. Anything we publish about them will carry the method and the evidence behind it.',
} as const;

/**
 * Publishable entries.
 *
 * All placeholders are `publish: false`. The research page filters on
 * `publish === true`, so this array currently renders nothing and the page shows
 * its documented empty state. To publish, follow `docs/RESEARCH.md`.
 */
export const researchEntries: readonly ResearchEntry[] = [
  {
    id: 'placeholder-agent-termination',
    title: 'Termination criteria for bounded agent loops',
    category: 'agentic',
    status: 'draft',
    publish: false,
    date: '2026-01-01',
    summary:
      'Placeholder. Template for a technical note. Replace the content and set publish: true only once the note exists and its claims have been reviewed.',
  },
  {
    id: 'placeholder-quantisation-task-quality',
    title: 'Task-level quality change under 4-bit quantisation',
    category: 'efficient-inference',
    status: 'draft',
    publish: false,
    date: '2026-01-01',
    summary:
      'Placeholder. Any published version must state the exact models, hardware, quantisation method, task and evaluation set used. No figure should appear here that has not been reproduced.',
  },
  {
    id: 'placeholder-retrieval-permission-filtering',
    title: 'Permission-aware retrieval without leaking ranking signal',
    category: 'evaluation',
    status: 'draft',
    publish: false,
    date: '2026-01-01',
    summary:
      'Placeholder. Template for a design note on applying access control at query construction rather than post-filtering a result set.',
  },
];

/** Entries safe to render. The only accessor components should use. */
export const publishedResearch: readonly ResearchEntry[] = researchEntries.filter(
  (entry) => entry.publish && entry.status === 'published',
);
