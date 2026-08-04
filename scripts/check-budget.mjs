/**
 * Performance budget.
 *
 * Runs after the export and fails the build if a payload has grown past its
 * ceiling. The point is not the absolute numbers — it is that a regression shows
 * up in a pull request instead of six months later on someone's phone.
 *
 * Budgets are measured on the *initial* payload separately from lazy chunks,
 * because the two matter differently. The WebGL bundle is large and always will
 * be; what matters is that it stays out of the critical path. If the split ever
 * breaks — a stray static import of `three` from a component that renders on the
 * server, say — INITIAL_JS blows past its ceiling immediately and this catches it.
 *
 * Sizes are uncompressed bytes on disk. GitHub Pages serves these gzipped, so the
 * transferred figures are roughly a third of these; uncompressed is used because
 * it is what the browser must parse and it does not vary with the host's
 * compression settings.
 *
 * Raising a budget is a decision, not a formality: put the reason in the commit
 * message.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'out');

const KB = 1024;

const BUDGETS = {
  /** JavaScript referenced directly by the homepage HTML — the critical path. */
  initialJs: 1000 * KB,
  /** Any single lazily-loaded chunk. The WebGL bundle is the one that matters. */
  largestLazyChunk: 1000 * KB,
  /** All CSS. One stylesheet per route group, all render-blocking. */
  totalCss: 200 * KB,
  /** The whole exported site, including fonts, icons and the social card. */
  totalExport: 8 * 1024 * KB,
};

if (!existsSync(OUT)) {
  console.error('  check-budget: out/ not found — run the build first.');
  process.exit(1);
}

/* Collect every file in the export. */
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else files.push({ path: p, rel: p.slice(OUT.length), size: s.size });
  }
};
walk(OUT);

const html = readFileSync(join(OUT, 'index.html'), 'utf8');

/* Scripts the homepage loads up front. Everything else is fetched on demand or
   not at all. */
const referenced = new Set(
  [...html.matchAll(/src="([^"]*\/_next\/static\/[^"]+\.js)"/g)].map((m) =>
    m[1].replace(/^.*\/_next\//, '/_next/'),
  ),
);

const jsFiles = files.filter((f) => f.rel.endsWith('.js') && f.rel.includes('/_next/static/'));
const initial = jsFiles.filter((f) => referenced.has(f.rel.replace(/\\/g, '/')));
const lazy = jsFiles.filter((f) => !referenced.has(f.rel.replace(/\\/g, '/')));

const sum = (list) => list.reduce((n, f) => n + f.size, 0);

const measured = {
  initialJs: sum(initial),
  largestLazyChunk: lazy.reduce((max, f) => Math.max(max, f.size), 0),
  totalCss: sum(files.filter((f) => f.rel.endsWith('.css'))),
  totalExport: sum(files),
};

const fmt = (n) => (n >= 1024 * KB ? `${(n / (1024 * KB)).toFixed(2)} MB` : `${Math.round(n / KB)} KB`);

const LABELS = {
  initialJs: 'Initial JS (critical path)',
  largestLazyChunk: 'Largest lazy chunk',
  totalCss: 'Total CSS',
  totalExport: 'Total export',
};

let failed = false;
const rows = [];
for (const key of Object.keys(BUDGETS)) {
  const used = measured[key];
  const budget = BUDGETS[key];
  const pct = Math.round((used / budget) * 100);
  const over = used > budget;
  if (over) failed = true;
  rows.push(
    `  ${over ? 'FAIL' : ' ok '}  ${LABELS[key].padEnd(26)} ${fmt(used).padStart(9)} / ${fmt(budget).padStart(9)}  ${String(pct).padStart(3)}%`,
  );
}

console.log('  check-budget:');
for (const r of rows) console.log(r);

if (initial.length === 0) {
  console.error('\n  check-budget: found no initial scripts — the HTML parse is wrong, not the budget.');
  process.exit(1);
}

/* A three.js-sized chunk on the critical path is the specific regression this
   guards against, so name it explicitly rather than leaving a bare number. */
const heavyInitial = initial.filter((f) => f.size > 400 * KB);
if (heavyInitial.length > 0) {
  console.error('\n  check-budget: a chunk over 400 KB is on the critical path:');
  for (const f of heavyInitial) console.error(`    ${fmt(f.size).padStart(9)}  ${f.rel}`);
  console.error(
    '\n  The WebGL bundle must stay behind the dynamic import in\n' +
      '  src/components/three/IntelligenceField.tsx. A static import of `three`,\n' +
      '  `@react-three/fiber` or `postprocessing` from a component outside\n' +
      '  src/components/three/ will pull it into the initial payload.',
  );
  failed = true;
}

if (failed) {
  console.error('\n  check-budget: over budget. See scripts/check-budget.mjs.');
  process.exit(1);
}
