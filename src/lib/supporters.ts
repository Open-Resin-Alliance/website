/**
 * Typed reader for the snapshot written by scripts/fetch-open-collective.mjs.
 *
 * Backers are read at build time from the committed snapshot; no page performs a
 * network request, and incognito contributors are dropped in the pipeline so
 * they can never reach the markup.
 */

import snapshot from '../data/supporters.json';

export interface Supporter {
  name: string | null;
  slug: string | null;
  type: string | null;
  imageUrl: string | null;
  url: string | null;
  since: string | null;
  /** All-time total contributed, from the contributors query. */
  amount: number;
  currency: string;
  /** True when the backer has an in-force recurring subscription. */
  recurring: boolean;
  /** Raw API frequency value: MONTHLY, YEARLY, FLEXIBLE or ONE_TIME. */
  frequency: string;
  /** Display label for `frequency`. */
  frequencyLabel: string;
  /** Current recurring charge, null for one-time contributions. */
  recurringAmount: number | null;
}

export interface SupportersSnapshot {
  generatedAt: string;
  source: string;
  collective: {
    name: string;
    slug: string;
    imageUrl: string | null;
    website: string | null;
    url: string;
    totalFinancialContributors: number;
  };
  host: Omit<Supporter, 'since' | 'amount' | 'currency'> | null;
  totals: {
    backers: number;
    contributors: number;
    raised: number;
    currency: string;
  };
  backers: Supporter[];
}

export const supporters = snapshot as unknown as SupportersSnapshot;

/** Collective URL, with a hardcoded fallback for a snapshot missing the field. */
export const collectiveUrl = supporters.collective?.url ?? 'https://opencollective.com/openresinalliance';

export function formatAmount(value: number, currency: string): string {
  try {
    // en-US renders USD as "$565" rather than the "US$565" that en-GB gives;
    // currency style is more conventional than it is locale-correct here.
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}
