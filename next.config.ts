import type { NextConfig } from 'next';
import path from 'node:path';

/**
 * Deployment target: GitHub Pages (static hosting).
 *
 * `output: 'export'` renders every route to plain HTML in `out/` at build time.
 * Consequences, all of which the codebase already respects:
 *
 *   - No runtime server. There are no POST route handlers; the contact form uses
 *     a client-side transport adapter (src/lib/contact/transport.ts). A ready
 *     serverless route is kept as a documented template in
 *     `docs/integrations/` for if the site ever moves to a Node/edge host.
 *   - No `headers()` / `redirects()` / middleware — Pages cannot honour them.
 *     Security headers are documented in `docs/DEPLOYMENT.md` instead, and the
 *     CSP is expressed as a <meta> tag in the root layout.
 *   - No next/image optimisation loader, hence `images.unoptimized`.
 *
 * `trailingSlash` matters for Pages: it emits `capabilities/index.html` rather
 * than `capabilities.html`, so `/capabilities/` resolves without a redirect.
 */

/**
 * Set NEXT_PUBLIC_BASE_PATH only when serving from a repository subpath, e.g.
 * `https://<user>.github.io/VGMLabs-website` -> `/VGMLabs-website`.
 * Leave empty when serving from a custom apex domain (the intended setup).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,

  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  images: {
    // No image optimisation server exists on static hosting.
    unoptimized: true,
  },

  sassOptions: {
    // Every *.module.scss file gets the design-token layer without a per-file
    // @use. Tokens are compile-time only (variables, maps, functions, mixins);
    // runtime theming happens through CSS custom properties in global.scss.
    loadPaths: [path.join(process.cwd(), 'src/styles')],
    additionalData: '@use "tokens" as *;',
  },

  experimental: {
    // Rewrites barrel imports to direct module paths so the client bundle only
    // carries the helpers actually referenced.
    // `@react-three/drei` and `motion` were listed here but never imported
    // anywhere in src/. Both have been removed from package.json — an unused
    // dependency is install time, lockfile churn and supply-chain surface for
    // nothing. Re-add them here if either is ever actually used.
    optimizePackageImports: ['gsap'],
  },

  // Fail the build on type errors rather than shipping a broken export.
  // (Linting is run as its own `npm run lint` step; Next 16 no longer wires it
  // into the build.)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
