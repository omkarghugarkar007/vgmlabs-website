/**
 * Content types.
 *
 * Every piece of editable copy on the site is typed here and authored in
 * `src/data/*`. Components receive data as props and never inline marketing
 * copy. This keeps the site editable without touching layout or WebGL code —
 * see `docs/CONTENT.md`.
 */

/** Identifier for one of the five Intelligence Field states. */
export type FieldStateId =
  | 'core' // hero — particles assembling into a concentrated core
  | 'agentic' // core separates into autonomous, communicating nodes
  | 'distributed' // network of local processing clusters (edge)
  | 'symbolic' // organic flow intersecting explicit geometric rules
  | 'production'; // stabilised, structured computational architecture

/* -------------------------------------------------------------------------- */
/* Company                                                                    */
/* -------------------------------------------------------------------------- */

export interface CompanyIdentity {
  /** Public-facing brand name. */
  readonly brand: string;
  /** Registered legal entity name. Footer and legal pages only. */
  readonly legalName: string;
  /** Supporting identifier used beside the wordmark. */
  readonly descriptor: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
  readonly countryCode: string;
  /** Corporate Identity Number. Footer / legal only. */
  readonly cin: string;
  readonly email: string;
  /** Canonical origin, no trailing slash. */
  readonly siteUrl: string;
  readonly foundedYear: number;
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** Mono annotation shown in the mobile menu and footer columns. */
  readonly hint?: string;
}

/* -------------------------------------------------------------------------- */
/* Homepage: system architecture rail                                         */
/* -------------------------------------------------------------------------- */

export interface ArchitectureStage {
  readonly id: string;
  readonly label: string;
  /** One line describing what this stage is responsible for. */
  readonly note: string;
}

/* -------------------------------------------------------------------------- */
/* Capabilities                                                               */
/* -------------------------------------------------------------------------- */

/** One of the four large capability chapters on the homepage. */
export interface CapabilityChapter {
  readonly id: string;
  /** Two-digit index, authored rather than derived so it can be reordered. */
  readonly index: string;
  readonly title: string;
  readonly description: string;
  /** Short technical labels rendered as a mono row. */
  readonly labels: readonly string[];
  /** Which Intelligence Field state this chapter drives. */
  readonly fieldState: FieldStateId;
  /** Deep-link target on the capabilities page. */
  readonly href: string;
}

/** A row in the extended capability matrix. */
export interface CapabilityMatrixEntry {
  readonly id: string;
  readonly ref: string;
  readonly name: string;
  /** Concise explanation revealed on hover / focus / expand. */
  readonly summary: string;
  /** Related technical disciplines. */
  readonly disciplines: readonly string[];
  /** The expected system outcome — capability, not a performance promise. */
  readonly outcome: string;
}

/** A system layer on the capabilities page. */
export interface SystemLayer {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  /** One-sentence framing used in the layer index. */
  readonly summary: string;
  readonly purpose: string;
  /** Representative technologies — categories and named open standards only. */
  readonly technologies: readonly string[];
  readonly architecture: readonly string[];
  readonly problems: readonly string[];
  readonly failureModes: readonly string[];
  readonly reliability: string;
  readonly fieldState: FieldStateId;
}

/* -------------------------------------------------------------------------- */
/* Approach                                                                   */
/* -------------------------------------------------------------------------- */

export interface ProcessStep {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly description: string;
  /** Concrete artefacts produced in this step. */
  readonly outputs: readonly string[];
}

export interface ApproachTopic {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Questions this stage of work is meant to answer. */
  readonly questions: readonly string[];
}

export interface ProductionRequirement {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

/* -------------------------------------------------------------------------- */
/* Deployment environments                                                    */
/* -------------------------------------------------------------------------- */

export type DeploymentTrait =
  | 'latency'
  | 'privacy'
  | 'connectivity'
  | 'compute'
  | 'reliability'
  | 'modelSize'
  | 'observability';

export interface DeploymentEnvironment {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  /**
   * Qualitative characteristics of the environment itself — not claims about
   * work delivered. Values are short descriptive phrases, never numbers.
   */
  readonly traits: Readonly<Record<DeploymentTrait, string>>;
  /** Normalised position in the 3D network, x/y/z in scene units. */
  readonly position: readonly [number, number, number];
  /** ids of environments this one links to in the network diagram. */
  readonly links: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Research                                                                   */
/* -------------------------------------------------------------------------- */

export type ResearchCategoryId =
  | 'agentic'
  | 'neuro-symbolic'
  | 'edge'
  | 'efficient-inference'
  | 'evaluation'
  | 'multimodal';

export interface ResearchCategory {
  readonly id: ResearchCategoryId;
  readonly label: string;
  readonly description: string;
}

/** An open research theme. Themes describe interest, not published results. */
export interface ResearchTheme {
  readonly id: string;
  readonly ref: string;
  readonly title: string;
  readonly category: ResearchCategoryId;
  /** What question the theme is investigating. */
  readonly question: string;
  readonly detail: string;
}

/**
 * A publishable research entry (note, write-up, technical report).
 *
 * `publish` gates rendering. Anything with `publish: false` is invisible on the
 * site — the research page filters on it. Do not set `publish: true` until the
 * entry exists and its claims are verified. See `docs/RESEARCH.md`.
 */
export interface ResearchEntry {
  readonly id: string;
  readonly title: string;
  readonly category: ResearchCategoryId;
  readonly status: 'draft' | 'review' | 'published';
  readonly publish: boolean;
  /** ISO 8601 date (YYYY-MM-DD). */
  readonly date: string;
  readonly summary: string;
  readonly authors?: readonly string[];
  /** Internal route or external URL. Omit while unpublished. */
  readonly href?: string;
  readonly readingTimeMinutes?: number;
}

/* -------------------------------------------------------------------------- */
/* Work                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * `demonstration` — internal capability demonstration built by VGM Labs.
 * `case-study`    — verified client engagement. Requires client approval.
 */
export type WorkKind = 'demonstration' | 'case-study';

/**
 * A work item. `publish` gates rendering exactly as it does for research.
 * Case studies must not be added until outcomes are verified and the client has
 * approved the wording. See `docs/CASE-STUDIES.md`.
 */
export interface WorkItem {
  readonly id: string;
  readonly kind: WorkKind;
  readonly publish: boolean;
  readonly title: string;
  /** Mono label describing the technical area. */
  readonly discipline: string;
  readonly summary: string;
  /** What the build establishes technically. No business metrics. */
  readonly establishes: readonly string[];
  readonly stack: readonly string[];
  readonly deployment: string;
  readonly href?: string;
  /** Present only on `case-study` items, and only when verified. */
  readonly client?: string;
}

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Team members. The team section is hidden entirely while this list is empty —
 * no placeholder people, no stock portraits. See `docs/CONTENT.md`.
 */
export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly focus: string;
  /** Path under /public. Omit rather than using a placeholder image. */
  readonly image?: string;
  readonly links?: readonly { readonly label: string; readonly href: string }[];
}

/* -------------------------------------------------------------------------- */
/* Legal                                                                      */
/* -------------------------------------------------------------------------- */

export interface LegalSection {
  readonly id: string;
  readonly heading: string;
  /** Each string is one paragraph. */
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
}

export interface LegalDocument {
  readonly title: string;
  readonly summary: string;
  /** ISO 8601 date the document text last changed. */
  readonly effectiveDate: string;
  readonly sections: readonly LegalSection[];
}
