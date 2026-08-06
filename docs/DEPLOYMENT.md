# Deployment

Target: **GitHub Pages**, static export, published by GitHub Actions.

---

## How it works

`next.config.ts` sets `output: 'export'`, so `npm run build` renders every route to
plain HTML in `out/`. `scripts/finalize-export.mjs` then does three things Pages needs
and Next does not do:

1. copies the generated `out/opengraph-image` to `out/og.png` — the route's own output
   has no file extension, and Pages serves an extensionless file as
   `application/octet-stream`, which social crawlers reject
2. guarantees `out/.nojekyll` exists — without it Jekyll silently drops the entire
   `_next/` directory, because it ignores paths beginning with an underscore
3. writes `out/CNAME` when `SITE_CNAME` is set

`.github/workflows/deploy.yml` runs on every push to `main`: install → typecheck →
lint → build → verify the export → publish via the Pages deployment API. No build
output is ever committed and no personal access token is needed.

---

## First-time setup

**1. Enable Actions as the Pages source**

Settings → Pages → Build and deployment → Source: **GitHub Actions**.

Without this the workflow runs and the deploy step fails.

**2. Add repository variables**

Settings → Secrets and variables → Actions → **Variables** (not Secrets — none of
these are secret):

| Variable | Example | When |
| --- | --- | --- |
| `SITE_URL` | `https://vgmlabsai.com` | Recommended. Drives canonical URLs, sitemap, Open Graph, JSON-LD `@id`. No trailing slash. |
| `SITE_CNAME` | `vgmlabsai.com` | Only with a custom domain. |
| `BASE_PATH` | `/VGMLabs-website` | Only when serving from a repository subpath. |

If `SITE_URL` is unset the build falls back to `https://vgmlabsai.com`, which is a
placeholder. Canonical tags pointing at a domain you do not control is the one SEO
mistake here with real consequences — set it.

**3. DNS**

Apex domain (`vgmlabsai.com`) — four `A` records:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Optionally the matching `AAAA` records:

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

Subdomain (`www.vgmlabsai.com`) — one `CNAME` to `<username>.github.io`.

Then Settings → Pages → **Custom domain**, enter the domain, and tick **Enforce
HTTPS** once the certificate is issued (usually minutes; occasionally up to an hour).

**4. Verify**

- `https://<domain>/` loads and the 3D field appears
- `https://<domain>/capabilities/` loads directly (not just via client navigation)
- `https://<domain>/sitemap.xml` and `/robots.txt` show the correct domain
- `https://<domain>/og.png` returns a PNG
- A nonsense path shows the 404 page
- Paste the URL into a Slack/X/LinkedIn compose box and confirm the card renders

---

## The contact form

There is no server, so nothing can POST to this origin. Delivery is a transport
adapter in `src/lib/contact/transport.ts`, chosen at runtime.

### mailto (default, no configuration)

The validated submission is formatted and handed to the visitor's own mail client as a
prefilled message addressed to `NEXT_PUBLIC_CONTACT_EMAIL` (default
`info@vgmlabsai.com`).

- Nothing is transmitted by us, no third party is involved, nothing can leak
- No cost, no account, no API key
- The success state explains what happened and offers the formatted text for copying,
  because a browser with no mail handler does nothing visible with a `mailto:` link
- Submissions are lost if someone has no mail client and does not use the copy button

### HTTP (a form service, or your own function)

Set `NEXT_PUBLIC_CONTACT_ENDPOINT` and the form POSTs JSON there instead. No code
change.

```
NEXT_PUBLIC_CONTACT_ENDPOINT=https://api.web3forms.com/submit
```

Works with Web3Forms, Formspree or similar. Both have free tiers that deliver straight
to Gmail and provide their own rate limiting and spam controls.

⚠️ `NEXT_PUBLIC_*` variables are **inlined into the client bundle and readable by
anyone who views source**. Only ever put a *public* form-service key here. Never an
API secret.

You will also need to widen the CSP in `src/app/layout.tsx`, which currently sets
`connect-src 'self'`:

```
"connect-src 'self' https://api.web3forms.com",
```

Some services expect their access key inside the payload rather than a header. Add it
in `deliverOverHttp` in `src/lib/contact/transport.ts`.

### Rate limiting

`src/lib/contact/throttle.ts` is a client-side fixed window in `localStorage`: four
submissions per hour per browser. It stops accidental double-submits and casual repeat
posting. It is **not** a security control — storage can be cleared and requests can be
sent directly.

Real rate limiting requires a server. With a form service, use theirs. With your own
function, `docs/integrations/contact-route.ts.example` has a working per-IP
implementation with an adapter for a shared store.

---

## Security headers

Pages cannot set response headers. The compensations:

- **CSP** is a `<meta http-equiv="Content-Security-Policy">` tag in the root layout.
  It is a partial mitigation, not an equivalent to the header:
  - App Router places root-layout head content **after** Next's own stylesheet and
    script tags, so those are not governed by it. They are same-origin and would be
    allowed regardless.
  - `frame-ancestors` is **ignored by spec** in a meta-delivered policy, so this
    provides no clickjacking protection. That needs a real header.
  - It does enforce `connect-src` (runtime fetches), `img-src`, `font-src`,
    `form-action`, `base-uri`, and the origin of dynamically injected scripts such
    as the WebGL chunk.
  - `unsafe-inline` is unavoidable for both styles and scripts under static export,
    since no nonce can be generated at request time. `unsafe-eval` is not granted.
- **HSTS** comes from GitHub Pages once **Enforce HTTPS** is enabled.
- `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` are not
  settable. If they are required for a compliance review, that is a reason to move to
  a host that can set headers.

The site loads no third-party scripts, sets no cookies, uses no analytics and
self-hosts its fonts, so the practical exposure is small.

---

## Moving to a server host later

If the site needs an API route, image optimisation or real headers:

1. Remove `output: 'export'`, `trailingSlash` and `images.unoptimized` from
   `next.config.ts`
2. Restore the `headers()` block (kept in git history) and remove the `<meta>` CSP
3. Copy `docs/integrations/contact-route.ts.example` to
   `src/app/api/contact/route.ts` and set `NEXT_PUBLIC_CONTACT_ENDPOINT=/api/contact`
4. Remove `export const dynamic = 'force-static'` from `sitemap.ts`, `robots.ts` and
   `opengraph-image.tsx` if you want them dynamic
5. Drop `scripts/finalize-export.mjs` from the build script — with a server, the
   `opengraph-image` route serves correctly on its own, and `src/lib/seo.ts` should go
   back to `absoluteUrl('opengraph-image')`

Nothing in `src/components` or `src/data` changes. The validation module in
`src/lib/validation/contact.ts` is already written to be imported by a server handler.

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Unstyled page, 404s on `/_next/*` | `.nojekyll` missing from the published output |
| CSS and JS 404 on a project URL | `BASE_PATH` not set when serving from a repo subpath |
| Canonical tags point at the wrong domain | `SITE_URL` not set |
| Social card does not render | `og.png` missing, or `SITE_URL` wrong; re-check `/og.png` directly |
| `/capabilities` 404s but `/capabilities/` works | `trailingSlash: true` is required; do not remove it on Pages |
| Custom domain reverts after a deploy | `SITE_CNAME` not set, so `out/CNAME` is not written and Pages loses the setting |
| Deploy step fails with a permissions error | Pages source is not set to "GitHub Actions" |
| **"There isn't a GitHub Pages site here"** — the site was working and now 404s everywhere | Pages has been **disabled** for the repository. Check with `gh api repos/<owner>/<repo>` and look at `has_pages`; if it is `false`, Pages is off and no amount of re-running the workflow will help, because the deploy target no longer exists. Re-enable it under Settings → Pages → Source: GitHub Actions (or `POST /repos/<owner>/<repo>/pages` with `{"build_type":"workflow"}`), then re-run the workflow. Note that a successful green workflow run does **not** mean the site is reachable — the deploy step can succeed against a Pages target that has since been turned off, so verify the live URL, not just the run |
