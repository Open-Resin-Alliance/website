/**
 * Single source of truth for organisation-level constants.
 * Every value here is verifiable from github.com/Open-Resin-Alliance.
 */

export const SITE = {
  name: 'Open Resin Alliance',
  shortName: 'ORA',
  url: 'https://openresin.org',
  /** Verbatim org description from the GitHub API. */
  description:
    'The Open Resin Alliance (ORA) advances open-source innovations for resin 3D printing, empowering creators with accessible tools, materials, and technology.',
  tagline: 'Advancing open-source resin 3D printing',
  email: 'github@openresin.org',
  /** Org creation date, from the GitHub API. */
  founded: '2024-08-15',
} as const;

export const LINKS = {
  github: 'https://github.com/Open-Resin-Alliance',
  githubRepos: 'https://github.com/orgs/Open-Resin-Alliance/repositories',
  discord: 'https://discord.gg/beFeTaPH6v',
  dragonfruitSite: 'https://dragonfruit-slicer.com',
  dragonfruitTranslate: 'https://translate.dragonfruit-slicer.com',
  openCollective: 'https://opencollective.com/open-resin-alliance',
  rss: '/rss.xml',
  email: 'mailto:github@openresin.org',
} as const;

export const NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

/** External GitHub org coordinates used by the stats pipeline. */
export const ORG = 'Open-Resin-Alliance';
