import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonoLabel } from '@/components/typography/MonoLabel';
import { Reveal } from '@/components/motion/Reveal';
import { ActionLink } from '@/components/ui/ActionLink';
import { FieldScrollDriver } from '@/components/three/FieldScrollDriver';
import {
  liveProducts,
  productStatusLabels,
  productsPage,
  publishedProducts,
} from '@/data/products';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import styles from './products.module.scss';

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description:
    'Software VGM Labs builds and operates itself, including LawSpeak. Each product states its status plainly — live, in development or planned.',
  path: '/products',
});

/**
 * Products.
 *
 * Each entry gets a full row rather than a card grid, so the status badge, the
 * description and what it is built on all have room. Status is stated on every one:
 * a product in development is never written in the present tense.
 */
export default function ProductsPage() {
  return (
    <>
      <FieldScrollDriver />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
            ]),
          ),
        }}
      />

      <Section density="flush">
        <PageHeader
          kicker="Products"
          lines={productsPage.headlineLines}
          lead={productsPage.lead}
          meta={[
            { label: 'Total', value: String(publishedProducts.length).padStart(2, '0') },
            {
              label: 'Live',
              value:
                liveProducts.length > 0
                  ? String(liveProducts.length).padStart(2, '0')
                  : 'None yet',
            },
            { label: 'Enquiries', value: 'Via the contact page' },
          ]}
        />
      </Section>

      <Section fieldState="production" density="tight" rule>
        <ol className={styles.products}>
          {publishedProducts.map((product, i) => {
            const isLive = product.status === 'live' && Boolean(product.href);

            return (
              <li key={product.id} id={product.id} className={styles.product}>
                <div className={styles.meta}>
                  <span className={styles.index} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <MonoLabel
                    className={[
                      styles.status,
                      isLive ? styles.statusLive : styles.statusPending,
                    ].join(' ')}
                  >
                    {productStatusLabels[product.status]}
                  </MonoLabel>
                  <MonoLabel className={styles.sector}>{product.sector}</MonoLabel>
                </div>

                <div className={styles.body}>
                  <h2 className={styles.name}>{product.name}</h2>

                  {product.summary ? (
                    <p className={styles.summary}>{product.summary}</p>
                  ) : null}

                  {product.detail ? (
                    <Reveal>
                      <p className={styles.detail}>{product.detail}</p>
                    </Reveal>
                  ) : null}

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

                  {isLive && product.href ? (
                    <ActionLink href={product.href} external variant="secondary">
                      {product.href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </ActionLink>
                  ) : (
                    <p className={styles.unavailable}>
                      Not yet available. If this is relevant to your organisation, we are
                      glad to talk while it is being built.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section density="default" rule>
        <div className={styles.outro}>
          <p className={styles.outroText}>
            Products and client engineering draw on the same six layers. If you need
            something built rather than bought, that is the same conversation.
          </p>
          <ActionLink href="/contact">Start a conversation</ActionLink>
        </div>
      </Section>
    </>
  );
}
