#!/usr/bin/env node
/**
 * Post-export step for GitHub Pages.
 *
 * Three things static hosting needs that `next build` does not do on its own:
 *
 * 1. A properly named social image.
 *    Next writes the `opengraph-image` route to `out/opengraph-image` — real PNG
 *    bytes, but no file extension. GitHub Pages serves an extensionless file as
 *    application/octet-stream, and social crawlers reject that; with
 *    `trailingSlash: true` the generated URL is also `/opengraph-image/`, which
 *    resolves to nothing. Copying it to `out/og.png` gives one canonical, correctly
 *    typed asset, which is what `src/lib/seo.ts` points at.
 *
 * 2. `.nojekyll`.
 *    Pages runs Jekyll by default, and Jekyll ignores directories beginning with an
 *    underscore — which would silently drop the entire `_next` bundle. The file is
 *    committed in `public/` and copied by Next, but it is cheap to guarantee.
 *
 * 3. `CNAME`, when a custom domain is configured.
 *    Pages reads the apex/subdomain from this file. Set SITE_CNAME in the deploy
 *    workflow (or leave it unset when serving from *.github.io).
 *
 * Idempotent: safe to run repeatedly, and it never fails the build for a missing
 * optional input.
 */

import { access, copyFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.cwd(), 'out');

const exists = async (file) => {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const log = (message) => process.stdout.write(`  finalize-export: ${message}\n`);

async function main() {
  if (!(await exists(OUT))) {
    // `next build` without `output: 'export'` produces no out/ — nothing to do
    // rather than a hard failure, so this script is safe in any configuration.
    log('no out/ directory; skipping');
    return;
  }

  // 1. Social image
  const generated = path.join(OUT, 'opengraph-image');
  const target = path.join(OUT, 'og.png');
  if (await exists(generated)) {
    await copyFile(generated, target);
    log('wrote og.png');
  } else {
    log('WARNING: out/opengraph-image not found — og.png was not written');
  }

  // 2. Jekyll opt-out
  const nojekyll = path.join(OUT, '.nojekyll');
  if (!(await exists(nojekyll))) {
    await writeFile(nojekyll, '');
    log('wrote .nojekyll');
  }

  // 3. Custom domain
  const domain = process.env.SITE_CNAME?.trim();
  if (domain) {
    await writeFile(path.join(OUT, 'CNAME'), `${domain}\n`);
    log(`wrote CNAME (${domain})`);
  }
}

main().catch((error) => {
  console.error('finalize-export failed:', error);
  process.exitCode = 1;
});
