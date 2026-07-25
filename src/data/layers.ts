import type { SystemLayer } from '@/types/content';

/**
 * The six system layers, used by the Capabilities page.
 *
 * The layer model is how VGM Labs decomposes an intelligent product. Content is
 * written to be technically serious but legible to a business decision-maker:
 * concrete nouns, named failure modes, no quantified claims.
 *
 * `technologies` lists categories and open standards. Named third-party products
 * appear only where they are genuinely ubiquitous and non-endorsing.
 */
export const systemLayers: readonly SystemLayer[] = [
  {
    id: 'experience-layer',
    index: '01',
    title: 'Experience Layer',
    summary: 'Interfaces, copilots, multimodal interaction and human oversight.',
    purpose:
      'The experience layer decides what a person can see, verify, correct and authorise. In a system whose outputs are probabilistic, the interface is a control surface rather than decoration: it sets expectations, exposes provenance, and makes the difference between a suggestion and a committed action unmistakable.',
    technologies: [
      'React and Next.js application shells',
      'Streaming and incremental response rendering',
      'Speech, image and document input handling',
      'Design systems with explicit state vocabularies',
      'Accessibility tooling and keyboard-first interaction',
    ],
    architecture: [
      'Distinguish drafting from committing. Reversible suggestions and irreversible effects must not share an affordance.',
      'Stream partial output where it reduces perceived latency, but never stream a value the user might act on before it is final.',
      'Attach provenance to every generated claim — source, timestamp, and the retrieval or tool call that produced it.',
      'Design the uncertain and empty states first. They occur far more often than the ideal path.',
      'Keep an escape hatch: the operator must be able to stop, edit or take over at any step.',
    ],
    problems: [
      'Domain experts need to review model output at volume without reading every token.',
      'Operators need to understand why a system proposed a particular action.',
      'Interaction spans text, files and images within one task.',
      'Regulated workflows require a recorded human authorisation before an effect is applied.',
    ],
    failureModes: [
      'Confident presentation of unverified output, which transfers the model’s uncertainty onto the user unnoticed.',
      'Interfaces that hide tool calls, so a failed retrieval is indistinguishable from an empty result.',
      'Latency with no feedback, which reads as a broken system and drives duplicate submissions.',
      'Approval fatigue: so many confirmations that operators stop reading them.',
    ],
    reliability:
      'We specify the interface’s state machine before building it — idle, generating, partial, verified, failed, superseded — and treat each state as a designed screen with its own copy. Provenance and confidence are data carried through the API, not styling applied at the end.',
    fieldState: 'core',
  },
  {
    id: 'agent-layer',
    index: '02',
    title: 'Agent Layer',
    summary: 'Planning, memory, orchestration, tools and multi-agent collaboration.',
    purpose:
      'The agent layer converts an objective into a bounded sequence of actions. It decides what to attempt next, which tool to use, what to remember, when to ask a human, and when to stop. Most production difficulty in agentic systems lives here — not in the model, but in the control loop wrapped around it.',
    technologies: [
      'Tool and function calling with typed schemas',
      'Durable execution and workflow engines for long-running tasks',
      'Short-term working state and long-term memory stores',
      'Planner / executor / critic decompositions',
      'Structured output and schema-constrained generation',
    ],
    architecture: [
      'Bound the loop explicitly: step limits, wall-clock limits, token budgets and a defined terminal state for every task.',
      'Make each tool a narrow, typed, individually authorised capability. Broad tools become the system’s widest attack surface.',
      'Persist the plan and its intermediate state outside the model context so a task can be resumed, inspected and replayed.',
      'Prefer a small number of specialised agents with clear contracts over a large pool of general ones.',
      'Treat memory as a product decision. What is retained, for how long, and who can see it are policy questions before they are technical ones.',
    ],
    problems: [
      'Work that requires many dependent steps and does not fit in a single context window.',
      'Processes that combine retrieval, calculation and writes to systems of record.',
      'Tasks needing supervised autonomy — the system proceeds alone until a defined threshold, then escalates.',
      'Coordination across sub-problems that have genuinely different competence requirements.',
    ],
    failureModes: [
      'Loop non-termination: retrying a failing step indefinitely, or oscillating between two plans.',
      'Compounding error, where a wrong intermediate result is treated as established fact by later steps.',
      'Tool misuse — correct call, wrong arguments, right shape — which passes schema validation and still corrupts data.',
      'Prompt injection reaching a privileged tool through retrieved or user-supplied content.',
      'Cost and latency growth that is invisible until the monthly bill or an SLA breach.',
    ],
    reliability:
      'Every agent runs under a budget and a permission set, and every tool call is traced with its arguments and result. Writes are idempotent and, where feasible, reversible. Escalation to a human is a designed path with its own interface, not an exception handler.',
    fieldState: 'agentic',
  },
  {
    id: 'intelligence-layer',
    index: '03',
    title: 'Intelligence Layer',
    summary: 'Language models, vision models, specialised models and symbolic components.',
    purpose:
      'The intelligence layer is the set of components that produce judgements: general and domain language models, vision and audio models, classical models, and the symbolic machinery — rules, solvers, search, verifiers — that constrains and checks them. Choosing the right mix is an engineering decision, not a preference.',
    technologies: [
      'Hosted frontier models and self-hosted open-weight models',
      'Small and task-specialised language models',
      'Detection, segmentation and embedding models',
      'Rule engines, constraint solvers and planners',
      'Deterministic verifiers and type-checked output schemas',
    ],
    architecture: [
      'Route by task difficulty. A large model for open-ended reasoning and a small one for classification is usually better than one model for both.',
      'Use symbolic components where correctness is checkable — arithmetic, scheduling, eligibility, unit conversion, policy constraints — and let the model handle interpretation.',
      'Keep the model boundary abstract enough to swap providers, but do not abstract away the differences that matter, such as tool-calling behaviour and context handling.',
      'Verify before committing. A generated action that fails a deterministic check should never reach a system of record.',
      'Decide build-versus-buy on evidence: measure prompting and retrieval first, and only then consider adaptation or training.',
    ],
    problems: [
      'Reasoning that must respect hard constraints, where a plausible answer is not an acceptable one.',
      'Domain language and document conventions that general models handle imprecisely.',
      'Latency or cost envelopes that a frontier model cannot meet.',
      'Deployments where model weights must remain inside the operator’s boundary.',
    ],
    failureModes: [
      'Fluent, well-formatted output that is factually or arithmetically wrong.',
      'Silent behaviour change when a hosted model is updated underneath a stable API.',
      'Over-fitting to a small evaluation set that does not represent live inputs.',
      'Fine-tuning applied to a problem that was actually a retrieval or prompt-context failure.',
      'Symbolic rules that drift out of sync with the policy they were written from.',
    ],
    reliability:
      'Model choice is recorded with the evidence behind it, and pinned by version. Anything checkable is checked by code rather than trusted from generation. Rules are stored as data with an owner and a review date, so a policy change is a data change.',
    fieldState: 'symbolic',
  },
  {
    id: 'knowledge-layer',
    index: '04',
    title: 'Knowledge Layer',
    summary: 'RAG, search, knowledge graphs, structured data and document understanding.',
    purpose:
      'The knowledge layer determines what the system can know at the moment it answers. It converts an organisation’s documents, records and streams into material a model can ground on — with the permissions, freshness and attribution that make grounding trustworthy.',
    technologies: [
      'Hybrid retrieval combining lexical and dense search',
      'Rerankers and query rewriting',
      'Vector stores, full-text indexes and graph databases',
      'Layout-aware document parsing and table extraction',
      'Entity resolution and incremental synchronisation',
    ],
    architecture: [
      'Retrieval quality is set by chunking and metadata long before it is set by the embedding model.',
      'Filter by permission at query time using the caller’s identity. Post-filtering a result set leaks existence and ranking information.',
      'Enforce citation. If a claim cannot be attributed to retrieved material, the system should decline rather than compose.',
      'Model freshness explicitly: index latency, change detection and deletion propagation are functional requirements.',
      'Use graph structure where questions are relational, and text search where questions are descriptive. Most real corpora need both.',
    ],
    problems: [
      'Answering from internal material that no public model has seen.',
      'Questions requiring several linked facts rather than one passage.',
      'Corpora where the same entity appears under different names across systems.',
      'Documents whose meaning depends on layout — tables, forms, annexes, signature blocks.',
    ],
    failureModes: [
      'Retrieving plausible but irrelevant passages, which the model then dutifully summarises.',
      'Permission bypass through a stale index or a shared cache.',
      'Deleted or superseded source documents that remain answerable.',
      'Chunk boundaries that split a table from its header or a clause from its condition.',
      'Evaluation on questions written from the documents, which measures recall of phrasing rather than usefulness.',
    ],
    reliability:
      'Retrieval is evaluated as its own component, with a question set written by domain users rather than derived from the corpus. Access control is applied at query construction. Index freshness and deletion propagation are monitored, and unattributable answers are treated as failures.',
    fieldState: 'production',
  },
  {
    id: 'operations-layer',
    index: '05',
    title: 'Operations Layer',
    summary: 'Evaluation, monitoring, guardrails, security and continuous improvement.',
    purpose:
      'The operations layer is how a system stays correct after launch. It defines what "working" means, measures it continuously, constrains what the system may do, and turns observed failures into changes that are verified before they ship.',
    technologies: [
      'Evaluation harnesses with versioned datasets',
      'Structured tracing across prompts, retrieval and tool calls',
      'Input and output mediation, including injection and PII screening',
      'Cost, token and latency attribution per feature',
      'Staged rollout, feature flags and instant rollback',
    ],
    architecture: [
      'Write the evaluation set before the feature. It forces a definition of correct that survives contact with production.',
      'Trace end-to-end. A response you cannot reconstruct — inputs, context, tool calls, model version — cannot be debugged.',
      'Separate guardrails by intent: correctness checks, safety filters and permission enforcement have different owners and failure responses.',
      'Attribute cost and latency per feature, not per deployment, so a regression is attributable.',
      'Route every production incident into the evaluation set. Regression suites should be a record of everything that has gone wrong once.',
    ],
    problems: [
      'Knowing whether a prompt, retrieval or model change actually improved the system.',
      'Detecting quality drift when a hosted model or the input distribution changes.',
      'Demonstrating to a reviewer or auditor why a specific decision was made.',
      'Keeping spend predictable as usage grows.',
    ],
    failureModes: [
      'Monitoring uptime and latency while quality degrades unmeasured.',
      'Evaluation sets that stop being representative, giving false confidence.',
      'Logs containing sensitive input, turning observability into a data-protection problem.',
      'Guardrails so broad they block legitimate use, which pushes users to work around the system.',
      'No rollback path for prompt and configuration changes, only for code.',
    ],
    reliability:
      'Evaluation runs in CI on every change to prompts, retrieval configuration or model version, and results are compared against a recorded baseline. Traces are redacted at capture. Rollback is a configuration change, and it is tested before it is needed.',
    fieldState: 'production',
  },
  {
    id: 'infrastructure-layer',
    index: '06',
    title: 'Infrastructure Layer',
    summary: 'Cloud, private environments, local inference, edge systems and model optimisation.',
    purpose:
      'The infrastructure layer is where the system actually runs, and the constraints of that environment propagate upward through every other layer. Latency budget, available accelerators, connectivity and data-residency rules determine which architectures are even possible.',
    technologies: [
      'Containerised serving and GPU scheduling',
      'On-device and embedded inference runtimes',
      'Quantization, distillation and pruning toolchains',
      'Offline dependency packaging and deterministic builds',
      'Local vector and document stores for disconnected operation',
    ],
    architecture: [
      'Establish the operating envelope first — latency, memory, power, connectivity, residency — and select models to fit it.',
      'Measure quality change whenever a model is quantized or distilled. Compression is a trade, and the trade must be quantified on your own task.',
      'Design for degraded connectivity rather than treating it as an error: local queueing, deferred sync, and a smaller local model as fallback.',
      'Keep the serving interface identical across environments so the application layer does not fork per deployment target.',
      'Plan the update path before the first install. Air-gapped and edge fleets are defined by how hard they are to change later.',
    ],
    problems: [
      'Data that cannot leave a jurisdiction, a facility or a network boundary.',
      'Interaction loops with a latency budget too tight for a round trip to a hosted model.',
      'Fleets of devices with fixed memory and thermal limits.',
      'Environments with no outbound network path at all.',
    ],
    failureModes: [
      'Benchmarking on a workstation and deploying to a device with a fraction of the memory bandwidth.',
      'Quantization applied without task-level evaluation, degrading exactly the reasoning the feature depended on.',
      'Thermal throttling that turns acceptable latency into unacceptable latency under sustained load.',
      'Hidden network dependencies — telemetry, licence checks, model downloads — that fail in an isolated environment.',
      'An update mechanism that requires physical access, so the fleet is effectively frozen at v1.',
    ],
    reliability:
      'Target hardware is profiled with the real workload, not a synthetic one, and compression is accepted only against measured task quality. Offline behaviour is tested by removing the network, not by mocking it. Every deployment target gets a documented update and rollback procedure.',
    fieldState: 'distributed',
  },
];
