import type {
  ArchitectureStage,
  CapabilityChapter,
  CapabilityMatrixEntry,
} from '@/types/content';

/* -------------------------------------------------------------------------- */
/* System architecture rail (homepage, positioning section)                    */
/* -------------------------------------------------------------------------- */

/**
 * The seven stages an intelligent system moves information through. Rendered as
 * a single horizontal rail with a scroll-driven signal, not as seven cards.
 */
export const architectureStages: readonly ArchitectureStage[] = [
  {
    id: 'input',
    label: 'Input',
    note: 'Requests, documents, sensor streams, events and system state arriving from the real world.',
  },
  {
    id: 'perception',
    label: 'Perception',
    note: 'Extraction and grounding — turning raw signal into typed, referenceable representations.',
  },
  {
    id: 'reasoning',
    label: 'Reasoning',
    note: 'Planning, decomposition, constraint checking and selection of the next viable action.',
  },
  {
    id: 'tools',
    label: 'Tools',
    note: 'Bounded access to retrieval, calculation, internal services and systems of record.',
  },
  {
    id: 'action',
    label: 'Action',
    note: 'Effects committed to real systems, inside permissions, with an auditable trail.',
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    note: 'Automated and human review against task-specific criteria and known failure modes.',
  },
  {
    id: 'learning',
    label: 'Learning',
    note: 'Findings routed back into prompts, policies, retrieval, datasets and model choice.',
  },
];

/* -------------------------------------------------------------------------- */
/* Four core capability chapters (homepage)                                    */
/* -------------------------------------------------------------------------- */

export const capabilityChapters: readonly CapabilityChapter[] = [
  {
    id: 'agentic-systems',
    index: '01',
    title: 'Agentic Systems',
    description:
      'Autonomous and human-supervised systems that plan, use tools, coordinate specialised agents and execute complex workflows.',
    labels: ['Planning', 'Tool Use', 'Memory', 'Orchestration', 'Guardrails'],
    fieldState: 'agentic',
    href: '/capabilities#agent-layer',
  },
  {
    id: 'edge-intelligence',
    index: '02',
    title: 'Edge Intelligence',
    description:
      'Optimised AI systems designed to operate locally with lower latency, stronger privacy and reduced dependence on continuous cloud connectivity.',
    labels: ['On-device Inference', 'Quantization', 'Small Models', 'Offline Operation'],
    fieldState: 'distributed',
    href: '/capabilities#infrastructure-layer',
  },
  {
    id: 'neuro-symbolic-ai',
    index: '03',
    title: 'Neuro-Symbolic AI',
    description:
      'Systems that combine learned representations with explicit rules, constraints, search and structured reasoning.',
    labels: ['Reasoning', 'Constraints', 'Search', 'Verification', 'Knowledge Graphs'],
    fieldState: 'symbolic',
    href: '/capabilities#intelligence-layer',
  },
  {
    id: 'generative-multimodal',
    index: '04',
    title: 'Generative and Multimodal AI',
    description:
      'Applications that understand and generate information across text, images, documents, audio and structured enterprise data.',
    labels: ['LLMs', 'Vision', 'Documents', 'RAG', 'Multimodal Pipelines'],
    fieldState: 'production',
    href: '/capabilities#knowledge-layer',
  },
];

/* -------------------------------------------------------------------------- */
/* Extended capability matrix (homepage)                                       */
/* -------------------------------------------------------------------------- */

/**
 * A technical index, not a feature list. Each entry states what the work is,
 * which disciplines it draws on, and what the resulting system can do.
 *
 * `outcome` describes a capability that follows from the engineering. It must
 * never contain a quantified performance claim.
 */
export const capabilityMatrix: readonly CapabilityMatrixEntry[] = [
  {
    id: 'ai-product-engineering',
    ref: 'C-01',
    name: 'AI Product Engineering',
    summary:
      'End-to-end delivery of software whose core behaviour depends on a model: interface, state handling, orchestration, persistence and the deterministic logic surrounding the probabilistic parts.',
    disciplines: ['Product architecture', 'TypeScript / Python services', 'Interface design', 'State machines'],
    outcome: 'A deployable application, not a notebook or a demo endpoint.',
  },
  {
    id: 'multi-agent-architecture',
    ref: 'C-02',
    name: 'Multi-Agent Architecture',
    summary:
      'Decomposition of a workflow into specialised agents with defined responsibilities, message contracts, shared state and an arbitration strategy for conflicting outputs.',
    disciplines: ['Distributed systems', 'Planning', 'Message contracts', 'Concurrency control'],
    outcome: 'Work that exceeds a single context window is split, coordinated and recombined.',
  },
  {
    id: 'enterprise-rag',
    ref: 'C-03',
    name: 'Enterprise RAG',
    summary:
      'Retrieval pipelines over internal corpora: chunking strategy, hybrid lexical and dense retrieval, reranking, citation enforcement and permission-aware filtering at query time.',
    disciplines: ['Information retrieval', 'Vector and lexical search', 'Access control', 'Evaluation'],
    outcome: 'Answers traceable to a source document the user is permitted to read.',
  },
  {
    id: 'knowledge-systems',
    ref: 'C-04',
    name: 'Knowledge Systems',
    summary:
      'Explicit representation of entities, relationships and rules so a system can answer questions that require structure rather than similarity.',
    disciplines: ['Knowledge graphs', 'Ontology design', 'Entity resolution', 'Graph query'],
    outcome: 'Multi-hop and constraint-bound questions become answerable and inspectable.',
  },
  {
    id: 'computer-vision',
    ref: 'C-05',
    name: 'Computer Vision',
    summary:
      'Detection, classification, segmentation and tracking pipelines, including the calibration and pre-processing work that determines whether a model behaves in situ.',
    disciplines: ['Detection and segmentation', 'Video pipelines', 'Dataset curation', 'Edge deployment'],
    outcome: 'Visual signal becomes structured events other systems can act on.',
  },
  {
    id: 'document-intelligence',
    ref: 'C-06',
    name: 'Document Intelligence',
    summary:
      'Layout-aware parsing, table and field extraction, classification and validation across scanned and digital documents, with confidence routing to human review.',
    disciplines: ['OCR and layout analysis', 'Structured extraction', 'Schema validation', 'Human-in-the-loop'],
    outcome: 'Unstructured documents become typed records with a review path for low-confidence cases.',
  },
  {
    id: 'model-fine-tuning',
    ref: 'C-07',
    name: 'Model Fine-Tuning',
    summary:
      'Dataset construction, parameter-efficient adaptation and held-out evaluation, applied when prompting and retrieval have been shown to be insufficient.',
    disciplines: ['Dataset design', 'LoRA / adapters', 'Preference tuning', 'Held-out evaluation'],
    outcome: 'A model adapted to a domain, with the evidence to show adaptation was warranted.',
  },
  {
    id: 'model-optimisation',
    ref: 'C-08',
    name: 'Model Optimisation',
    summary:
      'Quantization, distillation, pruning, batching strategy and runtime selection to fit a model inside a target latency, memory and power envelope.',
    disciplines: ['Quantization', 'Distillation', 'Kernel and runtime selection', 'Profiling'],
    outcome: 'A model that fits the hardware actually available, with quality changes measured.',
  },
  {
    id: 'ai-evaluation',
    ref: 'C-09',
    name: 'AI Evaluation',
    summary:
      'Task-specific evaluation sets, scoring rubrics, adversarial and regression suites, and the harness that runs them on every change to prompts, retrieval or models.',
    disciplines: ['Test design', 'Rubric and judge design', 'Statistical comparison', 'Regression harnesses'],
    outcome: 'Changes can be compared against a baseline instead of argued about.',
  },
  {
    id: 'ai-observability',
    ref: 'C-10',
    name: 'AI Observability',
    summary:
      'Structured tracing of prompts, retrieved context, tool calls, token spend and latency, joined to outcomes so production behaviour can be reconstructed after the fact.',
    disciplines: ['Distributed tracing', 'Structured logging', 'Cost attribution', 'Drift monitoring'],
    outcome: 'Any individual system response can be explained from recorded evidence.',
  },
  {
    id: 'llmops-mlops',
    ref: 'C-11',
    name: 'LLMOps and MLOps',
    summary:
      'Versioning for prompts, datasets, models and configuration; reproducible builds; staged rollout; and rollback that does not require a redeploy of the application.',
    disciplines: ['CI/CD', 'Artefact and prompt versioning', 'Feature flags', 'Reproducible environments'],
    outcome: 'Model and prompt changes ship on the same disciplined path as code.',
  },
  {
    id: 'secure-ai-deployment',
    ref: 'C-12',
    name: 'Secure AI Deployment',
    summary:
      'Threat modelling for model-driven systems: prompt injection, tool-permission escalation, data exfiltration through context, and secrets exposure in traces.',
    disciplines: ['Threat modelling', 'Input and output mediation', 'Least-privilege tooling', 'Audit logging'],
    outcome: 'Autonomous components operate inside boundaries that are enforced, not assumed.',
  },
  {
    id: 'on-premises-ai',
    ref: 'C-13',
    name: 'On-Premises AI',
    summary:
      'Model serving inside customer-controlled infrastructure — capacity planning, GPU scheduling, storage layout and upgrade procedure for an environment we do not administer.',
    disciplines: ['Containerised serving', 'GPU scheduling', 'Capacity planning', 'Operational runbooks'],
    outcome: 'Inference runs where the data already lives, under the operator’s own controls.',
  },
  {
    id: 'air-gapped-ai',
    ref: 'C-14',
    name: 'Air-Gapped AI',
    summary:
      'Systems designed to function with no outbound network path: offline model and dependency distribution, deterministic builds, and an update process that survives isolation.',
    disciplines: ['Offline packaging', 'Supply-chain verification', 'Local vector stores', 'Isolated evaluation'],
    outcome: 'Full functionality with no external dependency at run time.',
  },
  {
    id: 'edge-inference',
    ref: 'C-15',
    name: 'Edge Inference',
    summary:
      'Deployment to constrained targets — embedded accelerators, industrial gateways, mobile and browser runtimes — including thermal, memory and power behaviour under sustained load.',
    disciplines: ['On-device runtimes', 'Small language models', 'Memory budgeting', 'Thermal profiling'],
    outcome: 'Local inference that degrades predictably instead of failing when connectivity drops.',
  },
  {
    id: 'workflow-automation',
    ref: 'C-16',
    name: 'Workflow Automation',
    summary:
      'Automation of multi-step operational processes where some steps require judgement: routing, escalation, approvals, retries and compensating actions.',
    disciplines: ['Process modelling', 'Durable execution', 'Exception handling', 'Approval flows'],
    outcome: 'A process that completes reliably and escalates cleanly when it should not proceed.',
  },
  {
    id: 'data-pipelines',
    ref: 'C-17',
    name: 'Data Pipelines',
    summary:
      'Ingestion, normalisation, deduplication, incremental sync and lineage for the corpora and event streams an intelligent system depends on.',
    disciplines: ['Batch and streaming ingestion', 'Schema evolution', 'Lineage', 'Data quality checks'],
    outcome: 'The system reasons over current, deduplicated, attributable data.',
  },
  {
    id: 'system-integration',
    ref: 'C-18',
    name: 'API and System Integration',
    summary:
      'Connecting intelligent components to the systems that already run the business — identity, records, messaging and internal services — with typed contracts and explicit failure semantics.',
    disciplines: ['API design', 'Identity and SSO', 'Idempotency', 'Contract testing'],
    outcome: 'Intelligence operates inside existing systems rather than beside them.',
  },
];
