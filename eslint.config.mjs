import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescriptConfig from 'eslint-config-next/typescript';

/**
 * ESLint, flat config.
 *
 * `eslint-config-next` v16 exports flat config arrays directly, so they are spread
 * in rather than bridged through FlatCompat — the eslintrc compat layer fails on
 * this package's self-referencing plugin object.
 */
const config = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts', 'scripts/**'],
  },

  ...coreWebVitals,
  ...typescriptConfig,

  {
    rules: {
      // The React Three Fiber JSX namespace is declared by @react-three/fiber;
      // Next's config targets DOM React, so every three.js prop (`args`, `attach`,
      // `intensity`) would otherwise be reported as unknown.
      'react/no-unknown-property': 'off',

      // Unused variables are an error, but a leading underscore marks a deliberate
      // signature placeholder — the five formation callbacks share one shape and
      // not all of them need every argument.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],

      // No raster imagery ships with this site, and next/image has no optimisation
      // loader under static export — so a bare <img> is always a mistake here.
      '@next/next/no-img-element': 'error',
    },
  },

  {
    /**
     * The WebGL layer.
     *
     * React Compiler's `immutability` rule forbids mutating values after render
     * completes. That is correct for React data flow and fundamentally incompatible
     * with a render loop: every frame, `useFrame` callbacks write camera transforms,
     * instance matrices and typed-array attribute buffers in place. Allocating new
     * objects instead would mean thousands of allocations per second and a garbage
     * collector pause every few frames — the mutation *is* the optimisation.
     *
     * Scoped to these two directories, and only this rule. Everything else,
     * including the hook rules and the exhaustive-deps check, still applies here.
     */
    files: ['src/components/three/**/*.{ts,tsx}', 'src/lib/field/**/*.ts'],
    rules: {
      'react-hooks/immutability': 'off',
      // Same reason: refs are the correct place for per-frame scratch state, and the
      // compiler cannot distinguish that from a render-time read.
      'react-hooks/refs': 'off',
    },
  },
];

export default config;
