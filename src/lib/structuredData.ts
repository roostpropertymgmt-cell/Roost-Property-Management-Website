import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  telephone: z.string(),
  address: z.object({
    streetAddress: z.string(),
    addressLocality: z.string(),
    addressRegion: z.string(),
    postalCode: z.string(),
    addressCountry: z.string().default('US'),
  }),
  areaServed: z.array(z.string()).optional(),
  sameAs: z.array(z.string().url()).optional(),
});

export function LocalBusiness(input: z.infer<typeof businessSchema>) {
  const d = businessSchema.parse(input);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: d.name,
    url: d.url,
    telephone: d.telephone,
    address: { '@type': 'PostalAddress', ...d.address },
    areaServed: d.areaServed,
    sameAs: d.sameAs,
  };
}

export function Service({ name, description, provider }: { name: string; description: string; provider: { name: string; url: string } }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@type': 'LocalBusiness', name: provider.name, url: provider.url },
  };
}

export function FAQPage(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
