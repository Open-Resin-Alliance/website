/**
 * Typed reader for the snapshot written by scripts/fetch-github-stats.mjs.
 *
 * The site is fully static: every page reads this snapshot at build time, and
 * the snapshot is refreshed by .github/workflows/stats.yml (cron, webhook
 * dispatch, or manual run). Nothing here performs a network request.
 *
 * Per-repo counts come from one authenticated GraphQL query in that script, so
 * `openIssues` excludes pull requests, `openPulls` is the separate PR count and
 * `commits` is the default-branch commit count (null when unknown).
 */

import snapshot from '../data/github-stats.json';

export interface Release {
  repo: string;
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
  draft: boolean;
}

export interface RepoStats {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  license: string | null;
  stars: number;
  forks: number;
  /** Open issues, excluding pull requests (GraphQL issues totalCount). */
  openIssues: number;
  /** Open pull requests (GraphQL pullRequests totalCount). */
  openPulls: number;
  /** Commits on the default branch; null when unknown or the branch is empty. */
  commits: number | null;
  isFork: boolean;
  archived: boolean;
  topics: string[];
  defaultBranch: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  latestRelease: Release | null;
  latestStableRelease: Release | null;
  recentReleases: Release[];
}

export interface ActivityEntry {
  repo: string | null;
  date: string;
  actor: string | null;
  avatar: string | null;
  kind: 'release' | 'push' | 'create' | 'pull_request' | 'issue' | 'public';
  title: string;
  url: string | null;
  /** Number of consecutive pushes collapsed into this entry. */
  burst?: number;
}

export interface Contributor {
  login: string;
  contributions: number;
  url: string;
  avatarUrl: string;
}

export interface OrgMember {
  login: string;
  url: string;
  avatarUrl: string;
}

export interface VerifiedContributor {
  login: string;
  url: string;
  avatarUrl: string;
  repos: string[];
}

export interface StatsSnapshot {
  generatedAt: string;
  source: string;
  org: {
    login: string;
    name: string;
    description: string | null;
    url: string;
    avatarUrl: string;
    blog: string | null;
    email: string | null;
    publicRepos: number;
    followers: number;
    createdAt: string;
  };
  totals: {
    repos: number;
    forks: number;
    stars: number;
    /** Sum of issues-only counts; see RepoStats.openIssues. */
    openIssues: number;
    openPulls: number;
    commits: number;
    contributors: number;
    languages: Record<string, number>;
    activeRepos: number;
    releases: number;
  };
  repos: Record<string, RepoStats>;
  repoOrder: string[];
  recentReleases: Release[];
  contributors: { total: number; top: Contributor[] };
  /** Public members of the Open-Resin-Alliance GitHub organisation. */
  orgMembers?: OrgMember[];
  /** Non-bot contributors across flagship projects and the website repository. */
  verifiedContributors?: VerifiedContributor[];
  activity: ActivityEntry[];
  warnings: string[];
  count: number;
}

export const stats = snapshot as unknown as StatsSnapshot;

export function repoStats(repo: string): RepoStats | undefined {
  return stats.repos[repo];
}

/** Look up a public member of the GitHub org by login (case-insensitive). */
export function orgMember(login: string): OrgMember | undefined {
  const key = login.toLowerCase();
  return (stats.orgMembers ?? []).find((member) => member.login.toLowerCase() === key);
}

/** Look up a verified contributor across flagship repos and the website repo (case-insensitive). */
export function verifiedContributor(login: string): VerifiedContributor | undefined {
  const key = login.toLowerCase();
  const fromFull = (stats.verifiedContributors ?? []).find((entry) => entry.login.toLowerCase() === key);
  if (fromFull) return fromFull;
  const fromTop = stats.contributors.top.find((entry) => entry.login.toLowerCase() === key);
  return fromTop ? { login: fromTop.login, url: fromTop.url, avatarUrl: fromTop.avatarUrl, repos: [] } : undefined;
}

/** Most recent release of any kind, across the whole organisation. */
export const latestOrgRelease: Release | null =
  [...stats.recentReleases].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0] ?? null;
