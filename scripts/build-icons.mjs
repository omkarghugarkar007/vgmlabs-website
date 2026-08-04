/**
 * Generate the raster icon set from src/app/icon.svg.
 *
 * Only /icon.svg was declared, so /favicon.ico, /apple-touch-icon.png and
 * /manifest.webmanifest all 404'd — which means bookmarks, pinned tabs, iOS
 * home-screen saves and crawlers that do not read SVG showed a blank or default
 * icon.
 *
 * These are generated rather than committed as binaries so the one source of
 * truth stays the SVG. Change the mark there, re-run this, and everything
 * follows. Run it with `npm run icons`; the outputs are committed because the
 * build (and CI) must not depend on a headless browser being present.
 *
 * Rasterisation uses the Chrome that is already installed for review
 * screenshots. If it is missing the script explains what to do and exits
 * non-zero, rather than silently producing nothing.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SVG = join(root, 'src/app/icon.svg');
const PUBLIC = join(root, 'public');

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error(
    'build-icons: no Chrome/Chromium found. Install one, or regenerate the icons by\n' +
      'hand from src/app/icon.svg at 32x32 (favicon.ico), 180x180 (apple-touch-icon.png)\n' +
      'and 192/512 (manifest icons). The committed files remain valid until then.',
  );
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), 'vgm-icons-'));

/** Rasterise the SVG at an exact pixel size. */
function render(size) {
  // The SVG is wrapped in a page pinned to exactly size x size, so the screenshot
  // is the icon and nothing else.
  //
  // The width/height attributes are written onto the <svg> tag rather than left to
  // CSS. The source has neither (deliberately — it scales), and relying on the
  // stylesheet alone left the icon short of the viewport with a white band beneath
  // it. The page background is also set to the mark's own background colour, so
  // any residual rounding gap is graphite rather than white.
  const svg = readFileSync(SVG, 'utf8').replace(
    /<svg\b/,
    `<svg width="${size}" height="${size}"`,
  );
  const html = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;
background:#050607;line-height:0}
svg{display:block;width:${size}px;height:${size}px}</style>${svg}`;
  const page = join(work, `p${size}.html`);
  const out = join(work, `i${size}.png`);
  writeFileSync(page, html);
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--default-background-color=00000000',
      `--window-size=${size},${size}`,
      `--screenshot=${out}`,
      `file://${page}`,
    ],
    { stdio: ['ignore', 'ignore', 'ignore'] },
  );
  return readFileSync(out);
}

/* -------------------------------------------------------------------------- */
/* ICO                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Build a real .ico.
 *
 * A PNG renamed to .ico is not an ICO and older consumers reject it. The
 * container is small enough to write directly: a 6-byte header, one 16-byte
 * directory entry per image, then the image payloads. Embedding PNG rather than
 * BMP is supported everywhere that matters and avoids hand-rolling a bottom-up
 * BMP with an AND mask.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette count
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

/* -------------------------------------------------------------------------- */
/* PNG downscale                                                              */
/* -------------------------------------------------------------------------- */

/* Chrome renders each size natively, so no resampling is needed — every icon is
   rasterised at its final size from vector source. `deflateSync` is imported for
   the ICO path only if a re-encode is ever required; kept here so the dependency
   set stays visible. */
void deflateSync;

/* -------------------------------------------------------------------------- */

const sizes = [16, 32, 48, 180, 192, 512];
const rendered = new Map();
for (const s of sizes) rendered.set(s, render(s));

// favicon.ico — 16/32/48, the sizes Windows and browser chrome actually request.
writeFileSync(
  join(PUBLIC, 'favicon.ico'),
  buildIco([16, 32, 48].map((size) => ({ size, data: rendered.get(size) }))),
);

// iOS home screen. 180x180 is the current requirement.
writeFileSync(join(PUBLIC, 'apple-touch-icon.png'), rendered.get(180));
// Some older iOS versions request this exact filename at the root.
copyFileSync(join(PUBLIC, 'apple-touch-icon.png'), join(PUBLIC, 'apple-touch-icon-precomposed.png'));

// Manifest icons.
writeFileSync(join(PUBLIC, 'icon-192.png'), rendered.get(192));
writeFileSync(join(PUBLIC, 'icon-512.png'), rendered.get(512));

const report = [
  ['favicon.ico', 'ICO 16/32/48'],
  ['apple-touch-icon.png', '180×180'],
  ['apple-touch-icon-precomposed.png', '180×180'],
  ['icon-192.png', '192×192'],
  ['icon-512.png', '512×512'],
];
for (const [file, note] of report) {
  const bytes = readFileSync(join(PUBLIC, file)).length;
  console.log(`  build-icons: ${file.padEnd(34)} ${note.padEnd(12)} ${bytes} bytes`);
}
