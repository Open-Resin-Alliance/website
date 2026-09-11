/**
 * Typed reader for the snapshot written by scripts/fetch-github-stats.mjs.
 *
 * The site is fully static: every page reads this snapshot at build time, and
 * the snapshot is refreshed by .github/workflows/stats.yml (cron, webhook
 * dispatch, or manual run). Nothing here performs a network request.
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
  openIssues: number;
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
    openIssues: number;
    contributors: number;
    languages: Record<string, number>;
    activeRepos: number;
    releases: number;
  };
  repos: Record<string, RepoStats>;
  repoOrder: string[];
  recentReleases: Release[];
  contributors: { total: number; top: Contributor[] };
  activity: ActivityEntry[];
  warnings: string[];
  count: number;
}

export const stats = snapshot as unknown as StatsSnapshot;

export function repoStats(repo: string): RepoStats | undefined {
  return stats.repos[repo];
}

/** Most recent release of any kind, across the whole organisation. */
export const latestOrgRelease: Release | null =
  [...stats.recentReleases].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0] ?? null;
