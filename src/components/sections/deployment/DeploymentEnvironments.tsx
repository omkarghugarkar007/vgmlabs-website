'use client';

import { useId, useState } from 'react';
import {
  deploymentEnvironments,
  deploymentSection,
  deploymentTraitLabels,
} from '@/data/deployments';
import type { DeploymentTrait } from '@/types/content';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import { DeploymentDiagram } from './DeploymentDiagram';
import styles from './DeploymentEnvironments.module.scss';

const TRAIT_ORDER: readonly DeploymentTrait[] = [
  'latency',
  'privacy',
  'connectivity',
  'compute',
  'modelSize',
  'reliability',
  'observability',
];

/**
 * Deployment environments — one network, five destinations.
 *
 * Selecting an environment highlights its node and its links in the diagram and
 * swaps the trait table beside it. The selection is a radio group rather than a
 * set of tabs: the environments are alternatives, arrow keys move between them for
 * free, and the whole thing works without JavaScript having to manage focus.
 *
 * The copy describes properties of each environment — what its constraints are —
 * and the scope note states plainly that these are environments designed for, not
 * a list of delivered engagements.
 */
export function DeploymentEnvironments() {
  const [selectedId, setSelectedId] = useState(deploymentEnvironments[0].id);
  const groupName = useId();

  const selected =
    deploymentEnvironments.find((env) => env.id === selectedId) ?? deploymentEnvironments[0];

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <MonoLabel marker className={styles.eyebrow}>
            06 / Deployment
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d2"
            lines={deploymentSection.headlineLines}
            id="deployment-heading"
          />
        </div>

        <Reveal className={styles.headerAside}>
          <p className={styles.principle}>{deploymentSection.body}</p>
          <p className={styles.scope}>{deploymentSection.scopeNote}</p>
        </Reveal>
      </div>

      <div className={styles.body}>
        <fieldset className={styles.list}>
          <legend className="sr-only">Select a deployment environment</legend>

          {deploymentEnvironments.map((env) => {
            const active = env.id === selectedId;
            return (
              <label
                key={env.id}
                className={[styles.option, active ? styles.optionActive : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={env.id}
                  checked={active}
                  onChange={() => setSelectedId(env.id)}
                  className={styles.radio}
                />
                <span className={styles.optionMark} aria-hidden="true" />
                <span className={styles.optionBody}>
                  <span className={styles.optionLabel}>{env.label}</span>
                  <span className={styles.optionSummary}>{env.summary}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className={styles.visual}>
          <DeploymentDiagram selectedId={selectedId} />
          <MonoLabel className={styles.visualCaption}>
            One architecture, five destinations
          </MonoLabel>
        </div>
      </div>

      {/* Trait table. `aria-live="polite"` announces the change when a different
          environment is selected, without stealing focus from the radio group. */}
      <div className={styles.traits} aria-live="polite">
        <div className={styles.traitsHead}>
          <MonoLabel tone="cyan">{selected.label}</MonoLabel>
          <span className={styles.traitsRule} aria-hidden="true" />
          <MonoLabel className={styles.traitsHint}>Operating characteristics</MonoLabel>
        </div>

        <dl className={styles.traitGrid}>
          {TRAIT_ORDER.map((trait) => (
            <div key={trait} className={styles.trait}>
              <dt>{deploymentTraitLabels[trait]}</dt>
              <dd>{selected.traits[trait]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
