/** Date and number formatting shared by every page. */

const ABSOLUTE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const ABSOLUTE_LONG = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const MONTH_YEAR = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const MONTH_DAY = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

const NUMBER = new Intl.NumberFormat('en-GB');

const COMPACT = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });

const asDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

export const formatDate = (value: string | Date) => ABSOLUTE.format(asDate(value));
export const formatDateLong = (value: string | Date) => ABSOLUTE_LONG.format(asDate(value));
export const formatMonthYear = (value: string | Date) => MONTH_YEAR.format(asDate(value));
export const formatDayMonth = (value: string | Date) => MONTH_DAY.format(asDate(value));
export const formatNumber = (value: number) => NUMBER.format(value);

export const formatCompact = (value: number) => (value < 1000 ? NUMBER.format(value) : COMPACT.format(value));

/** Machine-readable timestamp for <time datetime>. */
export const isoDate = (value: string | Date) => asDate(value).toISOString();

const UNITS: [limitSeconds: number, perUnit: number, unit: Intl.RelativeTimeFormatUnit][] = [
  [60, 1, 'second'],
  [3600, 60, 'minute'],
  [86_400, 3600, 'hour'],
  [2_592_000, 86_400, 'day'],
  [31_536_000, 2_592_000, 'month'],
  [Number.POSITIVE_INFINITY, 31_536_000, 'year'],
];

/**
 * Human distance between a timestamp and the build time. Static output, so the
 * reference point is the moment `astro build` ran - see the "generated" line in
 * the footer for the exact time.
 */
export function formatRelative(value: string | Date, reference: Date = new Date()): string {
  const seconds = Math.round((asDate(value).getTime() - reference.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });
  for (const [limit, perUnit, unit] of UNITS) {
    if (Math.abs(seconds) < limit) return formatter.format(Math.round(seconds / perUnit), unit);
  }
  return formatDate(value);
}
