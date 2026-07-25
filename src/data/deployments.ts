import type { DeploymentEnvironment, DeploymentTrait } from '@/types/content';

/**
 * Deployment environments.
 *
 * These describe the *properties of each environment* — the constraints an
 * architecture must satisfy. They are not claims about work delivered to
 * customers. No entry should ever be edited to imply a completed engagement
 * unless a verified case study exists (see `docs/CASE-STUDIES.md`).
 *
 * `position` is in scene units for the 3D network; `links` defines the edges.
 */

export const deploymentTraitLabels: Readonly<Record<DeploymentTrait, string>> = {
  latency: 'Latency',
  privacy: 'Privacy posture',
  connectivity: 'Connectivity',
  compute: 'Compute',
  reliability: 'Reliability',
  modelSize: 'Model size',
  observability: 'Observability',
};

export const deploymentEnvironments: readonly DeploymentEnvironment[] = [
  {
    id: 'cloud',
    label: 'Cloud',
    summary:
      'Hosted models and managed infrastructure. The widest capability range and the fastest path to a working system, with data leaving the operator’s boundary.',
    traits: {
      latency: 'Network round trip dominates; typically hundreds of milliseconds per model call.',
      privacy: 'Governed by provider terms, region selection and data-processing agreements.',
      connectivity: 'Continuous connectivity assumed.',
      compute: 'Elastic. Accelerator capacity is a commercial question rather than a physical one.',
      reliability: 'Depends on provider availability; needs fallbacks for rate limits and deprecation.',
      modelSize: 'Largest available models, including frontier tiers.',
      observability: 'Rich tracing available, though model internals stay opaque.',
    },
    position: [0, 2.15, 0],
    links: ['private-cloud', 'on-premises', 'edge'],
  },
  {
    id: 'private-cloud',
    label: 'Private Cloud',
    summary:
      'Single-tenant infrastructure in a chosen region, running open-weight models the operator controls and can pin to a version.',
    traits: {
      latency: 'Comparable to cloud, with fewer noisy-neighbour and queueing effects.',
      privacy: 'Data remains within a tenant boundary and a chosen jurisdiction.',
      connectivity: 'Continuous, usually over private networking or a peered link.',
      compute: 'Provisioned rather than elastic; capacity planning becomes a real task.',
      reliability: 'Operator-controlled. Version pinning removes surprise model changes.',
      modelSize: 'Open-weight models sized to the provisioned accelerators.',
      observability: 'Full visibility, including serving-layer metrics and weights in use.',
    },
    position: [-2.65, 0.85, -0.55],
    links: ['cloud', 'on-premises'],
  },
  {
    id: 'on-premises',
    label: 'On-Premises',
    summary:
      'Inference inside the operator’s own facility and network, under their identity, storage and change-control regimes.',
    traits: {
      latency: 'Low and predictable on the local network; no egress hop.',
      privacy: 'Data and weights never leave the facility.',
      connectivity: 'Internal connectivity assumed; external access may be restricted.',
      compute: 'Fixed hardware. Model choice is bounded by installed accelerators.',
      reliability: 'Tied to local infrastructure, including power and cooling.',
      modelSize: 'Mid-size open-weight models, often quantized to fit available memory.',
      observability: 'Complete, but telemetry must stay inside the boundary.',
    },
    position: [2.75, 0.7, -0.35],
    links: ['cloud', 'private-cloud', 'air-gapped'],
  },
  {
    id: 'edge',
    label: 'Edge Devices',
    summary:
      'Inference on gateways, embedded accelerators, mobile hardware or in-browser runtimes, close to where the signal originates.',
    traits: {
      latency: 'Lowest achievable; no network in the interaction path.',
      privacy: 'Input can be processed and discarded locally without transmission.',
      connectivity: 'Intermittent by assumption. Offline operation is a requirement, not a fallback.',
      compute: 'Tightly bounded by memory, thermal envelope and power budget.',
      reliability: 'Must degrade predictably; sustained load introduces thermal throttling.',
      modelSize: 'Small and specialised models, quantized, often task-specific.',
      observability: 'Constrained. Telemetry is buffered locally and synchronised opportunistically.',
    },
    position: [-1.75, -1.65, 0.75],
    links: ['cloud', 'on-premises'],
  },
  {
    id: 'air-gapped',
    label: 'Air-Gapped',
    summary:
      'No outbound network path. Models, dependencies and updates arrive through a controlled offline process.',
    traits: {
      latency: 'Local only; determined entirely by on-site hardware.',
      privacy: 'Strongest available posture — no external egress exists.',
      connectivity: 'None. Any hidden network dependency is a defect.',
      compute: 'Fixed and known in advance; scaling requires physical change.',
      reliability: 'High once installed, provided the update path was designed up front.',
      modelSize: 'Bounded by installed hardware; weights distributed offline and verified.',
      observability: 'Fully local. Logs are reviewed in place or exported under policy.',
    },
    position: [1.95, -1.85, 0.5],
    links: ['on-premises'],
  },
];

export const deploymentSection = {
  headlineLines: ['Intelligence,', 'where it needs to run.'] as const,
  body: 'Architecture should follow the operational environment—not force the environment to follow the model.',
  /**
   * Explicit scope note. Prevents the section from implying delivered
   * engagements in each environment.
   */
  scopeNote:
    'These are the environments we design for, and the constraints each one imposes. Where a verified engagement exists it will be documented as a case study.',
} as const;
