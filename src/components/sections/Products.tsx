import { productStatusLabels, productsSection, publishedProducts } from '@/data/products';
import { DisplayHeading } from '@/components/typography/DisplayHeading';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import styles from './Products.module.scss';

/**
 * Products.
 *
 * VGM Labs' own software, as distinct from client engineering. Every entry carries
 * a visible status badge, which is what stops a roadmap item reading as a shipped
 * one — the honesty is structural rather than a matter of wording.
 *
 * Live products link out; anything not live deliberately has no link, so there is
 * nothing to click that would disappoint.
 *
 * Renders nothing when no product is published, so the section cannot appear empty.
 */
export function Products() {
  if (publishedProducts.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <MonoLabel marker className={styles.eyebrow}>
            02 / Products
          </MonoLabel>
          <DisplayHeading
            as="h2"
            step="d2"
            lines={productsSection.headlineLines}
            id="products-heading"
          />
        </div>

        <Reveal className={styles.headerAside}>
          <p className={styles.lead}>{productsSection.body}</p>
          <p className={styles.note}>{productsSection.note}</p>
        </Reveal>
      </div>

      <ul className={styles.list}>
        {publishedProducts.map((product, i) => {
          const isLive = product.status === 'live' && Boolean(product.href);

          // A live product is a link; anything else is a plain container, because
          // there is nowhere useful for it to go yet.
          const Inner = isLive ? 'a' : 'div';
          const linkProps = isLive
            ? { href: product.href, target: '_blank', rel: 'noopener noreferrer' }
            : {};

          return (
            <li key={product.id} className={styles.item}>
              <Inner
                {...linkProps}
                className={[styles.card, isLive ? styles.cardLive : ''].filter(Boolean).join(' ')}
              >
                <div className={styles.cardTop}>
                  <span className={styles.index} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <MonoLabel
                    className={[
                      styles.status,
                      product.status === 'live' ? styles.statusLive : styles.statusPending,
                    ].join(' ')}
                  >
                    {productStatusLabels[product.status]}
                  </MonoLabel>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.name}>
                    {product.name}
                    {isLive ? (
                      <svg
                        className={styles.arrow}
                        viewBox="0 0 14 14"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          d="M4 10 10 4M10 4H5.5M10 4v4.5"
                          fill="none"
                          stroke="currentColor"
                        />
                      </svg>
                    ) : null}
                  </h3>

                  <MonoLabel className={styles.sector}>{product.sector}</MonoLabel>

                  {product.summary ? (
                    <p className={styles.summary}>{product.summary}</p>
                  ) : null}
                </div>

                {product.builtOn?.length ? (
                  <div className={styles.builtOn}>
                    <MonoLabel className={styles.builtOnLabel}>Built on</MonoLabel>
                    <ul>
                      {product.builtOn.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {isLive ? (
                  <span className={styles.host}>
                    {product.href?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                ) : null}
              </Inner>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
