/**
 * Colours for the metadata chips on project cards.
 *
 * Languages use the conventional colours from GitHub's linguist palette, so a
 * chip matches what the same repository shows on GitHub. Licences are grouped by
 * how much they oblige you: warm tones for copyleft, cool for permissive.
 */

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Astro: '#ff5a03',
  Rust: '#dea584',
  Dart: '#00b4ab',
  Python: '#3572a5',
  Go: '#00add8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#8d8d8d',
  'C#': '#178600',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#663399',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Ruby: '#701516',
  PHP: '#4f5d95',
  Swift: '#f05138',
  Kotlin: '#a97bff',
};

const LICENSE_COLORS: Record<string, string> = {
  // Copyleft: warm.
  'AGPL-3.0': '#ea580c',
  'GPL-3.0': '#d97706',
  'LGPL-3.0': '#ca8a04',
  'MPL-2.0': '#a16207',
  // Permissive: cool.
  MIT: '#0891b2',
  'Apache-2.0': '#0d9488',
  'BSD-3-Clause': '#2563eb',
  'BSD-2-Clause': '#2563eb',
  ISC: '#0891b2',
  Unlicense: '#64748b',
};

/** Chip colours that are not derived from a name: gold stars, orange issues. */
export const STARS_COLOR = '#eab308';
export const ISSUES_COLOR = '#fb923c';

/**
 * Licence chips often carry a suffix the palette does not list, and projects
 * that publish a link without a name arrive as NOASSERTION or null.
 */
export function licenseColor(license: string | null | undefined): string | null {
  if (!license) return null;
  const base = license.replace(/-(or-later|only)$/i, '');
  return LICENSE_COLORS[license] ?? LICENSE_COLORS[base] ?? null;
}
