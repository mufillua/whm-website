import { COMPANY } from '../config/company.config';
import { CATEGORIES, CATEGORY_GROUPS } from '../../data/taxonomy.data';
import { absUrl } from './seo.service';

/**
 * schema.org structured data (JSON-LD) built only from facts in company.config.ts and the catalogue —
 * nothing invented (no prices, ratings or reviews, since the site publishes none).
 */

const SITE = absUrl('/');
export const BUSINESS_ID = `${SITE}#business`;
export const WEBSITE_ID = `${SITE}#website`;

const DAY_NAMES: Record<string, string[]> = {
  'Monday – Friday': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  Saturday: ['Saturday'],
  Sunday: ['Sunday'],
};

/** "10:00 AM – 6:00 PM" → ["10:00", "18:00"] */
function to24h(range: string): [string, string] | null {
  const parts = range.split(/\s*[–-]\s*/);
  if (parts.length !== 2) return null;
  const conv = (t: string) => {
    const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = Number(m[1]) % 12;
    if (m[3].toUpperCase() === 'PM') h += 12;
    return `${String(h).padStart(2, '0')}:${m[2]}`;
  };
  const a = conv(parts[0]), b = conv(parts[1]);
  return a && b ? [a, b] : null;
}

function openingHours() {
  return COMPANY.hours.flatMap((h) => {
    const days = DAY_NAMES[h.days];
    const times = to24h(h.time);
    return days && times ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: times[0], closes: times[1] }] : [];
  });
}

/** The shop itself — a local business in Kolkata. Shown on the home, about and contact pages. */
export function businessSchema() {
  const a = COMPANY.address;
  return {
    '@type': 'HardwareStore',
    '@id': BUSINESS_ID,
    name: COMPANY.name,
    slogan: COMPANY.tagline,
    description:
      'Kolkata supplier and stockist of hydraulic valves, quick release couplings, tube fittings, pressure gauges and process instrumentation, Taparia hand tools, and lifting and material handling equipment.',
    url: SITE,
    logo: absUrl('/logo.png'),
    image: [absUrl('/assets/seo/share-card.jpg'), absUrl('/logo.png')],
    telephone: COMPANY.phoneE164,
    email: COMPANY.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${a.lines[0]}, ${a.lines[1]}`,
      addressLocality: a.city,
      addressRegion: a.region,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    hasMap: COMPANY.mapsUrl,
    openingHoursSpecification: openingHours(),
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', telephone: COMPANY.phoneE164, email: COMPANY.email }],
    sameAs: COMPANY.social.map((s) => s.url),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Product catalogue',
      itemListElement: CATEGORY_GROUPS.map((g) => ({
        '@type': 'OfferCatalog',
        name: g.name,
        itemListElement: CATEGORIES.filter((c) => c.group === g.id).map((c) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Thing', name: c.name, url: absUrl(`/categories/${c.slug}`) },
        })),
      })),
    },
  };
}

/** Tells Google the site's name (shown above results) and who publishes it. Home page only. */
export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE,
    name: COMPANY.name,
    alternateName: `${COMPANY.name} Kolkata`,
    inLanguage: 'en-IN',
    publisher: { '@id': BUSINESS_ID },
  };
}

/** Breadcrumb trail shown in search results instead of the raw URL. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
}

/** A web page node linked to the business, e.g. AboutPage, ContactPage, CollectionPage. */
export function pageSchema(type: string, path: string, name: string, description: string) {
  return {
    '@type': type,
    '@id': absUrl(path) + '#webpage',
    url: absUrl(path),
    name,
    description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': BUSINESS_ID },
  };
}
