import { ImageResponse } from 'next/og';
import { company, shortDescription } from '@/data/company';

/**
 * Open Graph / Twitter card image.
 *
 * Generated at build time into a static PNG, so it works on static hosting with no
 * runtime image service. PNG rather than SVG because most platforms — including X,
 * LinkedIn and Facebook — will not render an SVG social card.
 *
 * Composed with the same vocabulary as the site: graphite ground, hairline grid, a
 * projected node structure, mono metadata. No web fonts are loaded — `next/og` would
 * need the font binary fetched at build time, and the system sans stack is close
 * enough at this size to not be worth the extra build dependency.
 */

/**
 * Required under `output: 'export'`. Without it Next treats a metadata image route
 * as dynamic and refuses to export, since there would be no server to render it on
 * request. The image depends only on build-time data, so pinning it is correct
 * rather than a workaround.
 */
export const dynamic = 'force-static';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${company.brand} — ${company.descriptor}`;

/** Golden-angle spiral: the same construction as the static field fallback. */
const NODES = Array.from({ length: 74 }, (_, i) => {
  const k = (i + 0.5) / 74;
  const radius = Math.sqrt(k) * 190;
  const angle = i * Math.PI * (3 - Math.sqrt(5));
  return {
    x: 250 + Math.cos(angle) * radius,
    y: 315 + Math.sin(angle) * radius * 0.9,
    size: 2 + (1 - k) * 5,
    opacity: 0.16 + (1 - k) * 0.6,
    accent: i % 13 === 0 ? '#ffb45c' : i % 6 === 0 ? '#8ce8e3' : '#ece9e2',
  };
});

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#050607',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Thin grid: the site's structural device, at card scale. */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`v${i}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 300 * i + 300,
              width: 1,
              background: 'rgba(36,40,45,0.5)',
              display: 'flex',
            }}
          />
        ))}

        {/* The node field, left of centre. */}
        {NODES.map((node, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              width: node.size,
              height: node.size,
              background: node.accent,
              opacity: node.opacity,
              display: 'flex',
            }}
          />
        ))}

        {/* Copy block, right. */}
        <div
          style={{
            position: 'absolute',
            left: 560,
            top: 96,
            right: 80,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 20,
              letterSpacing: 6,
              color: '#92979d',
              fontWeight: 600,
            }}
          >
            VGM LABS
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 8,
              fontSize: 15,
              letterSpacing: 4,
              color: '#5f656b',
              textTransform: 'uppercase',
            }}
          >
            Applied Intelligence
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 56,
              fontSize: 62,
              lineHeight: 1.04,
              letterSpacing: -2.4,
              color: '#ece9e2',
              fontWeight: 600,
            }}
          >
            Intelligence, engineered for the real world.
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 40,
              fontSize: 22,
              lineHeight: 1.5,
              color: '#92979d',
              maxWidth: 520,
            }}
          >
            {shortDescription}
          </div>
        </div>

        {/* Footer rule and metadata. */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            bottom: 62,
            height: 1,
            background: 'rgba(36,40,45,0.9)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            bottom: 26,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 15,
            letterSpacing: 3,
            color: '#5f656b',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>Agentic / Edge / Neuro-symbolic</div>
          <div style={{ display: 'flex' }}>{company.city}, {company.region}</div>
        </div>

        {/* Accent edge — the one piece of colour, bottom-left. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: 168,
            height: 3,
            background: '#4f72ff',
            display: 'flex',
          }}
        />
      </div>
    ),
    size,
  );
}
