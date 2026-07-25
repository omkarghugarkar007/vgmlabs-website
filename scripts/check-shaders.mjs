#!/usr/bin/env node
/**
 * Shader source lint. Runs before `next build`.
 *
 * This exists because of a bug that shipped and survived three rounds of visual
 * debugging: the particle vertex shader declared a variable named `asm`, which is a
 * reserved word in GLSL ES. The program failed to compile, so all 17,000 particles
 * were silently absent — a failed shader draws nothing and raises no page-level
 * error, and the browser console was the only place that said so.
 *
 * Two classes of mistake are caught here, both of which are invisible until runtime:
 *
 *   1. GLSL reserved words used as identifiers. The full ES 1.00 reserved list is
 *      long and mostly unmemorable (`asm`, `half`, `input`, `output`, `packed`,
 *      `this`, `union`, …), and nothing in the TypeScript toolchain knows the
 *      contents of a template literal is a shader.
 *
 *   2. A backtick inside a `/* glsl *​/` template literal, which silently terminates
 *      the JavaScript string. This happened twice while writing the shaders —
 *      once from `int` and once from `asm` in a comment — and produces a confusing
 *      "Expected a semicolon" parse error a hundred lines away from the cause.
 *
 * Deliberately a lint rather than a runtime check: by the time three.js reports
 * `VALIDATE_STATUS false`, the site is already deployed.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SHADER_DIR = path.resolve(process.cwd(), 'src/lib/field/shaders');

/** GLSL ES 1.00 reserved words that are not otherwise keywords. */
const RESERVED = [
  'asm', 'class', 'union', 'enum', 'typedef', 'template', 'this', 'packed',
  'goto', 'switch', 'default', 'inline', 'noinline', 'volatile', 'public',
  'static', 'extern', 'external', 'interface', 'long', 'short', 'double',
  'half', 'fixed', 'unsigned', 'input', 'output', 'sizeof', 'cast',
  'namespace', 'using', 'hvec2', 'hvec3', 'hvec4', 'dvec2', 'dvec3', 'dvec4',
  'fvec2', 'fvec3', 'fvec4', 'sampler2DRect', 'sampler3DRect',
];

/** Types that can begin a declaration, so `<type> <reserved>` is an identifier use. */
const TYPES = [
  'float', 'int', 'bool', 'void',
  'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'bvec2', 'bvec3', 'bvec4',
  'mat2', 'mat3', 'mat4', 'sampler2D', 'samplerCube',
];

/** Strip // and /* *​/ comments so a reserved word in prose is not reported. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));
}

/** Extract each `/* glsl *​/` template literal with its start offset. */
function extractGlslBlocks(source, file) {
  const blocks = [];
  const marker = /\/\* glsl \*\/\s*`/g;
  let match;

  while ((match = marker.exec(source)) !== null) {
    const start = match.index + match[0].length;
    const end = source.indexOf('`', start);

    if (end === -1) {
      throw new Error(
        `${file}: unterminated /* glsl */ template literal starting at offset ${start}`,
      );
    }

    blocks.push({ start, body: source.slice(start, end) });
    marker.lastIndex = end + 1;
  }

  return blocks;
}

const lineOf = (source, offset) => source.slice(0, offset).split('\n').length;

async function main() {
  let files;
  try {
    files = (await readdir(SHADER_DIR)).filter((f) => f.endsWith('.ts'));
  } catch {
    console.log('  check-shaders: no shader directory; skipping');
    return;
  }

  const problems = [];

  for (const name of files) {
    const file = path.join('src/lib/field/shaders', name);
    const source = await readFile(path.join(SHADER_DIR, name), 'utf8');

    // A backtick inside a GLSL block would already have broken the parse, but the
    // resulting error points somewhere unhelpful — so name it precisely.
    const escaped = /\\`/.test(source);
    if (escaped) {
      problems.push(`${file}: escaped backtick inside a GLSL literal — remove it, do not escape it`);
    }

    for (const block of extractGlslBlocks(source, file)) {
      const code = stripComments(block.body);

      for (const word of RESERVED) {
        // Identifier use: a declaration (`float asm`) or an assignment (`asm =`).
        const declaration = new RegExp(`\\b(?:${TYPES.join('|')})\\s+(${word})\\b`, 'g');
        const assignment = new RegExp(`\\b(${word})\\s*=[^=]`, 'g');

        for (const re of [declaration, assignment]) {
          let hit;
          while ((hit = re.exec(code)) !== null) {
            const line = lineOf(source, block.start + hit.index);
            problems.push(
              `${file}:${line}: '${word}' is a GLSL ES reserved word and cannot be an identifier. ` +
                `The shader will fail to compile and draw nothing.`,
            );
          }
        }
      }
    }
  }

  // A declaration and an assignment on the same line both match, so report once.
  const unique = [...new Set(problems)];

  if (unique.length > 0) {
    console.error('\n  check-shaders FAILED\n');
    for (const problem of unique) console.error(`    ${problem}`);
    console.error('');
    process.exit(1);
  }

  console.log(`  check-shaders: ${files.length} shader source file(s) clean`);
}

main().catch((error) => {
  console.error('check-shaders errored:', error.message);
  process.exit(1);
});
