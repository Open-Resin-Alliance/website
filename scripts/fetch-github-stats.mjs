#!/usr/bin/env node
/**
 * Build-time GitHub stats pipeline.
 *
 * Runs before `astro build` (locally or in .github/workflows/stats.yml) and
 * writes a deterministic snapshot to src/data/github-stats.json. The site only
 * ever reads that snapshot, so a build never depends on the network.
 *
 * Usage:
 *   node scripts/fetch-github-stats.mjs           # refresh the snapshot
 *   node scripts/fetch-github-stats.mjs --offline # validate what is on disk
 *
 * GITHUB_TOKEN raises the rate limit from 60 to 5000 requests/hour.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORG = 'Open-Resin-Alliance';
const OUT = resolve(fileURLToPath(new URL('../src/data/github-stats.json', import.meta.url)));
const API = 'https://api.github.com';

/** Repos we count contributors for; keeps the API budget small and stable. */
const CONTRIBUTOR_REPOS = ['DragonFruit', 'Orion', 'Odyssey', 'VoxelShift'];

const headers = {
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
  'user-agent': 'openresin.org-stats',
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const warnings = [];

async function api(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const error = new Error(`${res.status} ${res.statusText} for ${path}${body ? ` — ${body.slice(0, 200)}` : ''}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

/** Same semantics as api(), but a failure records a warning instead of aborting. */
async function apiOptional(path, fallback, { quiet404 = false } = {}) {
  try {
    return await api(path);
  } catch (error) {
    // A 404 is the documented answer for "this repo has no such resource", not
    // a problem worth reporting — /releases/latest 404s for every repo that has
    // never cut a stable release.
    if (!(quiet404 && error.status === 404)) warnings.push(String(error.message ?? error));
    return fallback;
  }
}

const iso = (value) => (value ? String(value) : null);

function normaliseRepo(repo) {
  return {
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? null,
    url: repo.html_url,
    homepage: repo.homepage || null,
    language: repo.language ?? null,
    license: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : null,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    watchers: repo.subscribers_count ?? null,
    isFork: Boolean(repo.fork),
    isTemplate: Boolean(repo.is_template),
    archived: Boolean(repo.archived),
    hasPages: Boolean(repo.has_pages),
    topics: repo.topics ?? [],
    defaultBranch: repo.default_branch ?? null,
    createdAt: iso(repo.created_at),
    updatedAt: iso(repo.updated_at),
    pushedAt: iso(repo.pushed_at),
  };
}

function normaliseRelease(repo, release) {
  if (!release) return null;
  return {
    repo,
    tag: release.tag_name,
    name: release.name || release.tag_name,
    url: release.html_url,
    publishedAt: iso(release.published_at ?? release.created_at),
    prerelease: Boolean(release.prerelease),
    draft: Boolean(release.draft),
  };
}

async function collect() {
  const org = await api(`/orgs/${ORG}`);
  const repos = await api(`/orgs/${ORG}/repos?per_page=100&sort=pushed&type=public`);

  const own = repos.filter((r) => !r.fork).map(normaliseRepo).sort((a, b) => a.name.localeCompare(b.name));

  // Latest release per repo, in small concurrent batches to stay friendly.
  const releaseEntries = await Promise.all(
    own.map(async (repo) => {
      // Two different questions, two endpoints: the paged list gives the newest
      // release of any kind, while /releases/latest is the newest one that is
      // neither a prerelease nor a draft. Only looking at the newest five would
      // hide a stable release that predates a run of branch prereleases.
      const [releases, stableRelease] = await Promise.all([
        apiOptional(`/repos/${ORG}/${repo.name}/releases?per_page=5`, []),
        apiOptional(`/repos/${ORG}/${repo.name}/releases/latest`, null, { quiet404: true }),
      ]);
      const sorted = [...releases].sort(
        (a, b) => Date.parse(b.published_at ?? b.created_at) - Date.parse(a.published_at ?? a.created_at),
      );
      return [
        repo.name,
        {
          latest: normaliseRelease(repo.name, sorted[0]),
          stable: normaliseRelease(repo.name, stableRelease),
          recent: sorted.slice(0, 5).map((r) => normaliseRelease(repo.name, r)),
        },
      ];
    }),
  );
  const releasesByRepo = Object.fromEntries(releaseEntries);

  for (const repo of own) {
    const extra = releasesByRepo[repo.name] ?? { latest: null, stable: null, recent: [] };
    repo.latestRelease = extra.latest;
    repo.latestStableRelease = extra.stable;
    repo.recentReleases = extra.recent;
  }

  const recentReleases = Object.values(releasesByRepo)
    .flatMap((entry) => entry.recent)
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 12);

  // Contributors, deduplicated across the flagship repos.
  const contributorLists = await Promise.all(
    CONTRIBUTOR_REPOS.map((name) =>
      apiOptional(`/repos/${ORG}/${name}/contributors?per_page=100`, []).then((list) =>
        list.filter((entry) => entry.type !== 'Bot' && !entry.login?.endsWith('[bot]')),
      ),
    ),
  );
  const contributors = new Map();
  for (const list of contributorLists) {
    for (const entry of list) {
      const current = contributors.get(entry.login) ?? { login: entry.login, contributions: 0, url: entry.html_url, avatarUrl: entry.avatar_url };
      current.contributions += entry.contributions ?? 0;
      contributors.set(entry.login, current);
    }
  }
  const contributorTop = [...contributors.values()].sort((a, b) => b.contributions - a.contributions);

  // Org activity feed — the closest thing GitHub gives us to a webhook stream.
  const events = await apiOptional(`/orgs/${ORG}/events?per_page=100`, []);
  const activity = events
    .map((event) => {
      const repo = event.repo?.name?.split('/')[1] ?? null;
      const date = iso(event.created_at);
      const base = { repo, date, actor: event.actor?.login ?? null, avatar: event.actor?.avatar_url ?? null };
      switch (event.type) {
        case 'ReleaseEvent':
          return { ...base, kind: 'release', title: `released ${event.payload?.release?.tag_name ?? ''}`.trim(), url: event.payload?.release?.html_url ?? null };
        case 'PushEvent': {
          const branch = String(event.payload?.ref ?? '').replace(/^refs\/heads\//, '');
          const count = event.payload?.size ?? event.payload?.commits?.length ?? 0;
          const detail = count > 0 ? `${count} commit${count === 1 ? '' : 's'}` : 'commits';
          return {
            ...base,
            kind: 'push',
            title: branch ? `pushed ${detail} to ${branch}` : `pushed ${detail}`,
            url: `https://github.com/${event.repo?.name}`,
          };
        }
        case 'CreateEvent': {
          const ref = event.payload?.ref ?? event.payload?.ref_type ?? 'reference';
          return { ...base, kind: 'create', title: `created ${ref}`, url: `https://github.com/${event.repo?.name}` };
        }
        case 'PullRequestEvent':
          return { ...base, kind: 'pull_request', title: `${event.payload?.action ?? 'updated'} pull request #${event.payload?.number ?? ''}`.trim(), url: event.payload?.pull_request?.html_url ?? null };
        case 'IssuesEvent':
          return { ...base, kind: 'issue', title: `${event.payload?.action ?? 'updated'} issue #${event.payload?.issue?.number ?? ''}`.trim(), url: event.payload?.issue?.html_url ?? null };
        case 'PublicEvent':
          return { ...base, kind: 'public', title: 'made the repository public', url: `https://github.com/${event.repo?.name}` };
        default:
          return null;
      }
    })
    .filter((entry) => entry && entry.date)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 40)
    .reduce((feed, entry) => {
      const previous = feed.at(-1);
      const sameRepoPush =
        previous && previous.kind === 'push' && entry.kind === 'push' && previous.repo === entry.repo;
      if (sameRepoPush) {
        previous.burst = (previous.burst ?? 1) + 1;
        return feed;
      }
      feed.push(entry);
      return feed;
    }, [])
    .slice(0, 24);

  const languages = {};
  for (const repo of own) {
    if (!repo.language) continue;
    languages[repo.language] = (languages[repo.language] ?? 0) + 1;
  }

  const activeWindowDays = 90;
  const cutoff = Date.now() - activeWindowDays * 86_400_000;

  return {
    generatedAt: new Date().toISOString(),
    source: `${API}/orgs/${ORG}`,
    org: {
      login: org.login,
      name: org.name,
      description: org.description ?? null,
      url: org.html_url,
      avatarUrl: org.avatar_url,
      blog: org.blog || null,
      email: org.email || null,
      publicRepos: org.public_repos ?? own.length,
      followers: org.followers ?? 0,
      createdAt: iso(org.created_at),
    },
    totals: {
      repos: own.length,
      forks: own.reduce((sum, r) => sum + r.forks, 0),
      stars: own.reduce((sum, r) => sum + r.stars, 0),
      openIssues: own.reduce((sum, r) => sum + r.openIssues, 0),
      contributors: contributorTop.length,
      languages,
      activeRepos: own.filter((r) => r.pushedAt && Date.parse(r.pushedAt) > cutoff).length,
      releases: own.reduce((sum, r) => sum + (r.latestRelease ? 1 : 0), 0),
    },
    repos: Object.fromEntries(own.map((repo) => [repo.name, repo])),
    repoOrder: own.map((repo) => repo.name),
    recentReleases,
    contributors: { total: contributorTop.length, top: contributorTop.slice(0, 8) },
    activity,
    warnings: [...warnings],
    count: own.length,
  };
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    return null;
  }
}

function printSummary(snapshot) {
  const { totals, org, activity } = snapshot;
  console.log(`snapshot generatedAt ${snapshot.generatedAt}`);
  console.log(`org      ${org.login} — ${totals.repos} repos, ${org.followers} followers`);
  console.log(`totals   ${totals.stars} stars, ${totals.forks} forks, ${totals.openIssues} open issues, ${totals.contributors} contributors`);
  console.log(`active   ${totals.activeRepos} repos pushed in the last 90 days`);
  console.log(`activity ${activity.length} events, latest ${activity[0]?.date ?? 'n/a'} (${activity[0]?.repo ?? 'n/a'})`);
  const stable = Object.values(snapshot.repos)
    .filter((r) => r.latestStableRelease)
    .map((r) => `${r.name}@${r.latestStableRelease.tag}`)
    .sort();
  const builds = Object.values(snapshot.repos)
    .filter((r) => r.latestRelease && !r.latestStableRelease)
    .map((r) => `${r.name}@${r.latestRelease.tag}`)
    .sort();
  console.log(`stable   ${stable.join(', ') || 'none'}`);
  console.log(`no stable yet (newest build) ${builds.join(', ') || 'none'}`);
  if (snapshot.warnings?.length) {
    console.log(`warnings (${snapshot.warnings.length}):`);
    for (const warning of snapshot.warnings) console.log(`  - ${warning}`);
  }
}

const offline = process.argv.includes('--offline');

if (offline) {
  const existing = await readExisting();
  if (!existing) {
    console.error(`no snapshot at ${OUT} — run without --offline first`);
    process.exit(1);
  }
  printSummary(existing);
  const ageHours = (Date.now() - Date.parse(existing.generatedAt)) / 3_600_000;
  console.log(`age      ${ageHours.toFixed(1)} hours`);
  process.exit(0);
}

const previous = await readExisting();

let snapshot;
try {
  snapshot = await collect();
} catch (error) {
  console.error(`stats refresh failed: ${error.message ?? error}`);
  if (previous) {
    console.error('keeping the existing snapshot; the build will use stale-but-valid data');
    printSummary(previous);
    process.exit(0);
  }
  console.error('no existing snapshot to fall back on — failing');
  process.exit(1);
}

// Keep previously known repo metadata the API dropped from this run.
if (previous?.repos) {
  for (const [name, repo] of Object.entries(snapshot.repos)) {
    const before = previous.repos[name];
    if (!before) continue;
    if (!repo.latestRelease && before.latestRelease) repo.latestRelease = before.latestRelease;
    if (!repo.latestStableRelease && before.latestStableRelease) repo.latestStableRelease = before.latestStableRelease;
    if (!repo.recentReleases?.length && before.recentReleases?.length) repo.recentReleases = before.recentReleases;
  }
  if (!snapshot.recentReleases.length && previous.recentReleases?.length) {
    snapshot.recentReleases = previous.recentReleases;
  }
  if (!snapshot.activity.length && previous.activity?.length) snapshot.activity = previous.activity;
  if (!snapshot.contributors.top.length && previous.contributors?.top?.length) {
    snapshot.contributors = previous.contributors;
  }
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
printSummary(snapshot);
console.log(`wrote ${OUT}`);
