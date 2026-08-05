'use client';

import { useMemo, useState } from 'react';
import type { ResearchCategoryId } from '@/types/content';
import {
  publishedResearch,
  researchCategories,
  researchThemes,
} from '@/data/research';
import { MonoLabel } from '@/components/typography/MonoLabel';
import styles from './ResearchLibrary.module.scss';

type Filter = ResearchCategoryId | 'all';

/**
 * The research library.
 *
 * Two lists, one filter. `publishedResearch` is pre-filtered on `publish === true`
 * and `status === 'published'` at the data layer, so an unfinished entry cannot
 * reach this component even by mistake — the gate is not a rendering condition that
 * someone might remove.
 *
 * When nothing is published (the current state), the entries list shows an explicit
 * note rather than an empty container. The themes below are always shown: an open
 * question makes no claim that needs verifying.
 */
export function ResearchLibrary() {
  const [filter, setFilter] = useState<Filter>('all');

  const categoryLabel = (id: ResearchCategoryId) =>
    researchCategories.find((category) => category.id === id)?.label ?? id;

  const visibleThemes = useMemo(
    () => (filter === 'all' ? researchThemes : researchThemes.filter((t) => t.category === filter)),
    [filter],
  );

  const visibleEntries = useMemo(
    () =>
      filter === 'all'
        ? publishedResearch
        : publishedResearch.filter((entry) => entry.category === filter),
    [filter],
  );

  const activeCategory =
    filter === 'all' ? null : researchCategories.find((category) => category.id === filter);

  return (
    <div className={styles.library}>
      {/* Filters. A toolbar of toggle buttons rather than tabs: the list below is
          filtered content, not a separate panel per category. */}
      <div className={styles.filters} role="group" aria-label="Filter by research area">
        <button
          type="button"
          className={[styles.filter, filter === 'all' ? styles.filterActive : '']
            .filter(Boolean)
            .join(' ')}
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All areas
          <span className={styles.filterCount}>{researchThemes.length}</span>
        </button>

        {researchCategories.map((category) => {
          const count = researchThemes.filter((t) => t.category === category.id).length;
          // A chip reading "0" is a filter that leads nowhere, and a number
          // advertising that we have nothing in an area. Every category has themes
          // today; this makes sure a future data edit cannot change that.
          if (count === 0) return null;
          const active = filter === category.id;
          return (
            <button
              key={category.id}
              type="button"
              className={[styles.filter, active ? styles.filterActive : '']
                .filter(Boolean)
                .join(' ')}
              aria-pressed={active}
              onClick={() => setFilter(category.id)}
            >
              {category.label}
              <span className={styles.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {activeCategory ? (
        <p className={styles.categoryNote}>{activeCategory.description}</p>
      ) : null}

      {/* Write-ups.

          The whole section is conditional on there being something in it.

          It used to render unconditionally: a heading, a counter reading
          "0 published", and a paragraph beginning "Nothing published in this area
          yet." That is three separate ways of saying the same absence, given a
          heading and a rule so it reads as a section of the page. An empty
          section is not honesty — it is an announcement, and it is the first thing
          a reader's eye lands on.

          Nothing has been fabricated to fill it. The page now leads with the open
          questions, which is real content and the actual point of the page. The
          moment an entry sets `publish: true` in src/data/research.ts, this
          section appears above them with its count. */}
      {visibleEntries.length > 0 ? (
        <section className={styles.block} aria-labelledby="entries-heading">
          <div className={styles.blockHead}>
            <MonoLabel as="h2" id="entries-heading">
              Notes and write-ups
            </MonoLabel>
            <span className={styles.rule} aria-hidden="true" />
            <MonoLabel className={styles.blockCount}>
              {visibleEntries.length}
            </MonoLabel>
          </div>

          <ol className={styles.entries}>
            {visibleEntries.map((entry) => (
              <li key={entry.id} className={styles.entry}>
                <div className={styles.entryMeta}>
                  <MonoLabel className={styles.entryCategory}>
                    {categoryLabel(entry.category)}
                  </MonoLabel>
                  <time dateTime={entry.date} className={styles.entryDate}>
                    {formatDate(entry.date)}
                  </time>
                </div>

                <div className={styles.entryBody}>
                  <h3 className={styles.entryTitle}>
                    {entry.href ? (
                      <a href={entry.href} className={styles.entryLink}>
                        {entry.title}
                      </a>
                    ) : (
                      entry.title
                    )}
                  </h3>
                  <p className={styles.entrySummary}>{entry.summary}</p>
                  {entry.authors?.length ? (
                    <p className={styles.entryAuthors}>{entry.authors.join(', ')}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Open questions. */}
      <section className={styles.block} aria-labelledby="themes-heading">
        <div className={styles.blockHead}>
          <MonoLabel as="h2" id="themes-heading">
            Open questions
          </MonoLabel>
          <span className={styles.rule} aria-hidden="true" />
          <MonoLabel className={styles.blockCount}>{visibleThemes.length} themes</MonoLabel>
        </div>

        <ol className={styles.themes}>
          {visibleThemes.map((theme) => (
            <li key={theme.id} className={styles.theme}>
              <div className={styles.themeMeta}>
                <span className={styles.themeRef}>{theme.ref}</span>
                <MonoLabel className={styles.themeCategory}>
                  {categoryLabel(theme.category)}
                </MonoLabel>
              </div>

              <div className={styles.themeBody}>
                <h3 className={styles.themeTitle}>{theme.title}</h3>
                <p className={styles.themeQuestion}>{theme.question}</p>
                <p className={styles.themeDetail}>{theme.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** ISO date to a compact, unambiguous display form. */
function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}
