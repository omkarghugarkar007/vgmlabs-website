import type { ApproachTopic, ProcessStep, ProductionRequirement } from '@/types/content';

/* -------------------------------------------------------------------------- */
/* Five-step process (homepage + approach page)                                */
/* -------------------------------------------------------------------------- */

/**
 * Rendered as one continuous computational path with a scroll-driven signal.
 * `outputs` are the artefacts a client actually receives at each step.
 */
export const processSteps: readonly ProcessStep[] = [
  {
    id: 'understand',
    index: '01',
    title: 'Understand',
    description:
      'Define the problem, operating environment, data and success criteria.',
    outputs: [
      'Written problem statement with a measurable definition of success',
      'Operating envelope: latency, privacy, connectivity, compute',
      'Data inventory and access assessment',
      'Explicit list of what the system will not do',
    ],
  },
  {
    id: 'prototype',
    index: '02',
    title: 'Prototype',
    description:
      'Validate the highest-risk assumptions using focused technical experiments.',
    outputs: [
      'Narrow experiments targeting the assumptions that would invalidate the design',
      'A first evaluation set drawn from real inputs',
      'Baseline results and a recommendation, including "do not build this"',
      'Architecture decision record with the options rejected',
    ],
  },
  {
    id: 'engineer',
    index: '03',
    title: 'Engineer',
    description:
      'Build the complete application, orchestration, evaluation and integration layers.',
    outputs: [
      'Production application with the deterministic logic around the model',
      'Orchestration, permissions, guardrails and failure handling',
      'Evaluation suite wired into continuous integration',
      'Integrations against identity and systems of record',
    ],
  },
  {
    id: 'deploy',
    index: '04',
    title: 'Deploy',
    description:
      'Optimise the system for its actual cloud, edge, on-premises or air-gapped environment.',
    outputs: [
      'Environment-specific build, with model optimisation where required',
      'Observability: tracing, cost attribution, quality signals',
      'Staged rollout plan and tested rollback procedure',
      'Operational runbook and handover documentation',
    ],
  },
  {
    id: 'improve',
    index: '05',
    title: 'Improve',
    description:
      'Measure behaviour, evaluate failure modes and continuously refine the system.',
    outputs: [
      'Review of live behaviour against the original success criteria',
      'Incidents and edge cases folded into the regression suite',
      'Prioritised changes to prompts, retrieval, models or policy',
      'Verified improvements shipped on the same path as code',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Approach page — how the work is actually run                               */
/* -------------------------------------------------------------------------- */

export const approachTopics: readonly ApproachTopic[] = [
  {
    id: 'problem-discovery',
    title: 'Problem discovery',
    body: 'Engagements begin with the workflow, not the technology. We map who does the work today, what they decide, where the process stalls, and what an acceptable outcome looks like in their words. The output is a problem statement narrow enough to be falsified — and occasionally the conclusion that the problem does not need a model at all.',
    questions: [
      'Who performs this work today, and what does it cost them?',
      'What decision is being made, and against which criteria?',
      'What does an unacceptable outcome look like, and who absorbs it?',
      'Would a deterministic system solve this more cheaply?',
    ],
  },
  {
    id: 'technical-feasibility',
    title: 'Technical feasibility',
    body: 'Feasibility is assessed against the specific operating envelope rather than in the abstract. A capability that works in a hosted environment with a two-second budget may be impossible in a disconnected one with two hundred milliseconds. We identify the assumption most likely to break the design and test that first.',
    questions: [
      'Which single assumption, if false, invalidates the whole approach?',
      'What is the latency, memory and cost budget per interaction?',
      'Is the required capability demonstrated in current models, or hoped for?',
      'What is the fallback when the model is unavailable or wrong?',
    ],
  },
  {
    id: 'dataset-assessment',
    title: 'Dataset assessment',
    body: 'We audit what data exists, who may access it, how current it is, and whether it can legally and practically leave its current boundary. This includes the unglamorous questions — duplication, inconsistent identifiers, undocumented conventions — that determine whether retrieval or training is viable.',
    questions: [
      'Is the data accessible, current and attributable to a source?',
      'How are the same entities identified across systems?',
      'What permissions govern each collection, and how are they enforced?',
      'Does an evaluation set exist, and if not, who can write one?',
    ],
  },
  {
    id: 'architecture-selection',
    title: 'Architecture selection',
    body: 'Architecture follows the constraints. Retrieval, agentic orchestration, symbolic components, fine-tuning and local inference are options with different costs and failure characteristics, and we choose between them explicitly. Decisions are recorded with the alternatives that were rejected and why.',
    questions: [
      'What is the simplest architecture that could meet the criteria?',
      'Which parts must be deterministic, and which can be probabilistic?',
      'Where does the system need to be inspectable or auditable?',
      'What will this look like at ten times the current volume?',
    ],
  },
  {
    id: 'model-selection',
    title: 'Model selection',
    body: 'Models are selected against the task, the envelope and the deployment boundary — measured on a project-specific evaluation set, not on public leaderboards. Most systems use more than one model, with the largest reserved for the reasoning that genuinely requires it.',
    questions: [
      'Which model tier does each step of the task actually require?',
      'Must weights remain inside the operator’s boundary?',
      'What happens when a hosted model is updated or deprecated?',
      'Is a small specialised model sufficient for the highest-volume step?',
    ],
  },
  {
    id: 'build-versus-buy',
    title: 'Build versus buy',
    body: 'We prefer existing components for anything that is not differentiating: authentication, queues, vector stores, tracing, document conversion. Custom engineering is reserved for the reasoning, orchestration and domain logic that constitute the actual product. We will say when a commercial tool is the better answer.',
    questions: [
      'Is this component differentiating, or infrastructure?',
      'What is the total cost of owning it, including operation?',
      'Does buying create a dependency the deployment environment cannot accept?',
      'Can we replace this later without rewriting the application?',
    ],
  },
  {
    id: 'prototyping',
    title: 'Prototyping',
    body: 'Prototypes exist to retire risk, not to impress. Each one targets a named assumption, runs against real inputs, and produces a comparable result. A prototype that cannot fail was not testing anything.',
    questions: [
      'What specific claim does this prototype test?',
      'What result would cause us to abandon the approach?',
      'Are the inputs representative of production, including the awkward cases?',
      'How long should this take before it stops being worth continuing?',
    ],
  },
  {
    id: 'evaluations',
    title: 'Evaluations',
    body: 'Evaluation is built with the feature and run in continuous integration. Sets are written from real inputs, scored against rubrics agreed with domain users, and extended every time production surprises us. Without this, changes to prompts, retrieval or models are indistinguishable from guesswork.',
    questions: [
      'What does correct mean for this task, in reviewable terms?',
      'Who owns the rubric, and how often is it revisited?',
      'Does the suite include known failure modes and adversarial inputs?',
      'Can two candidate configurations be compared on evidence?',
    ],
  },
  {
    id: 'security',
    title: 'Security',
    body: 'Model-driven systems introduce failure modes conventional threat models do not cover: instructions arriving inside retrieved content, tool permissions escalating through chained calls, and sensitive data leaking through context or traces. We threat-model the agent loop and the tool surface specifically, and enforce least privilege per tool.',
    questions: [
      'What is the maximum damage a compromised prompt could cause?',
      'Which tools can write, and what authorises each call?',
      'Can untrusted content reach a privileged action path?',
      'What sensitive data appears in prompts, logs and traces?',
    ],
  },
  {
    id: 'integration',
    title: 'Integration',
    body: 'Intelligent components have to operate inside systems that already exist. We integrate against identity providers, systems of record and internal services with typed contracts, idempotent writes and explicit failure semantics — so a model-side failure degrades rather than corrupts.',
    questions: [
      'Which system is authoritative for each piece of data?',
      'Are writes idempotent, and are they reversible?',
      'How does the surrounding system behave when the model fails?',
      'Which team owns each boundary after handover?',
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment',
    body: 'The deployment target is a design input from day one. Cloud, private cloud, on-premises, edge and air-gapped environments differ in latency, available accelerators, update path and permitted dependencies. We keep the serving interface stable across targets so the application does not fork per environment.',
    questions: [
      'Where must inference physically run, and why?',
      'What is the update and rollback path in that environment?',
      'Which dependencies are unavailable at run time?',
      'Who operates this once it is live?',
    ],
  },
  {
    id: 'observability',
    title: 'Observability',
    body: 'Production behaviour is reconstructed from recorded evidence: prompts, retrieved context, tool calls, model versions, latency and token spend, joined to outcomes. Traces are redacted at capture so observability does not become its own data-protection problem.',
    questions: [
      'Can a single response be fully explained after the fact?',
      'Which quality signals are monitored, not just uptime?',
      'How is cost attributed to features and to tenants?',
      'What triggers an alert, and who receives it?',
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    body: 'Intelligent systems drift: inputs change, hosted models are updated, source documents move, and policies are revised. Maintenance means a scheduled review of live behaviour against the original criteria, a regression suite that grows with every incident, and a versioned path for changing prompts and policy without redeploying the application.',
    questions: [
      'How is quality drift detected before users report it?',
      'Who reviews and updates the evaluation set?',
      'How are prompt and policy changes versioned and rolled back?',
      'What documentation does the operating team need to run this alone?',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* "AI systems fail outside the demo"                                         */
/* -------------------------------------------------------------------------- */

export const productionRequirements: readonly ProductionRequirement[] = [
  {
    id: 'deterministic-surroundings',
    title: 'Deterministic surrounding systems',
    body: 'The probabilistic component should be as small as possible. Validation, permissions, arithmetic, routing and persistence belong in ordinary code where behaviour is exact and testable.',
  },
  {
    id: 'failure-handling',
    title: 'Failure handling',
    body: 'Every model call, tool call and retrieval can fail, time out or return something unusable. Each needs a defined response: retry with different parameters, degrade to a simpler path, or stop and escalate.',
  },
  {
    id: 'evaluation-datasets',
    title: 'Evaluation datasets',
    body: 'A held-out set of real inputs with agreed expectations is what makes improvement measurable. Without one, every change is a matter of opinion and every regression is discovered by users.',
  },
  {
    id: 'permission-boundaries',
    title: 'Permission boundaries',
    body: 'Tools and retrieval run with the caller’s authority, not the system’s. Each capability is granted individually, and the blast radius of any single compromised instruction stays bounded.',
  },
  {
    id: 'auditability',
    title: 'Auditability',
    body: 'For decisions that affect people, money or compliance, the system must be able to show its inputs, its retrieved evidence, its tool calls and who authorised the outcome.',
  },
  {
    id: 'cost-controls',
    title: 'Cost controls',
    body: 'Token spend scales with usage, retries and context length — often non-linearly. Budgets per task, per tenant and per feature, plus attribution in traces, keep spend predictable.',
  },
  {
    id: 'latency-controls',
    title: 'Latency controls',
    body: 'Interaction has a latency budget, and a chain of model and tool calls consumes it quickly. Timeouts, parallelism, caching, smaller models for high-volume steps and streaming all buy headroom.',
  },
  {
    id: 'fallback-behaviour',
    title: 'Fallback behaviour',
    body: 'When the primary model, connection or index is unavailable, the system should still do something useful: serve a cached result, use a smaller local model, queue for later, or say clearly that it cannot proceed.',
  },
  {
    id: 'human-intervention',
    title: 'Human intervention paths',
    body: 'Someone must be able to inspect a run, correct it, approve it or stop it. That path is a designed part of the product with its own interface and its own tests.',
  },
];

export const approachIntro = {
  headlineLines: ['Research depth.', 'Production discipline.'] as const,
  body: 'The distance between a working prototype and a system an organisation can depend on is mostly engineering. We treat that distance as the substance of the work rather than an afterthought.',
} as const;

export const failureSection = {
  heading: 'AI systems fail outside the demo',
  intro:
    'A demonstration runs on curated inputs, with its author present, on a good connection, with no permission model and no cost ceiling. Production has none of those properties. The gap is predictable, which means it can be engineered for.',
  outro:
    'None of this is exotic. It is the same discipline applied to any system with real consequences — made explicit because model-driven components fail in less familiar ways.',
} as const;
