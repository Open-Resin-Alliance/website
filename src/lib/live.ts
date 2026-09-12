/**
 * Browser refresh of the numbers a page was built with.
 *
 * The site is static: without JavaScript every value comes from the committed
 * snapshots in `src/data/`, and that stays true whenever the APIs cannot be
 * reached - offline, rate limited, blocked, or down. This module only ever
 * improves on those numbers; it never blanks one out or shows an error, so the
 * page a visitor gets is the page that was built, optionally with fresher data.
 *
 * One GitHub call per page, no token: an unauthenticated browser gets 60 GitHub
 * requests per hour per IP, so anything that costs a call per repository stays
 * snapshot-only - open issue, pull request and commit counts, contributor
 * totals, per-release tags - and the result is reused for five minutes across
 * pages. The Open Collective snapshot is rendered exactly as built: the backers
 * block names people and their fiscal host, and has no number left to refresh.
 */
import { ORG } from '../data/site';
import { formatCompact, formatDate, formatNumber, formatRelative } from './format';

const GITHUB_API = 'https://api.github.com';
const CACHE_KEY = 'ora.live.v1';
const CACHE_TTL_MS = 5 * 60 * 1000;
const ACTIVE_WINDOW_MS = 90 * 86_400_000;
const JUST_NOW_MS = 90 * 1000;

interface LiveRepo {
  stars: number;
  forks: number;
  pushedAt: string | null;
}

interface LiveTotals {
  repos: number;
  stars: number;
  forks: number;
  activeRepos: number;
}

interface LiveStats {
  repos: Record<string, LiveRepo>;
  totals: LiveTotals;
}

/** The GitHub payload with the moment it arrived, reused for five minutes. */
interface Cache {
  stats?: { at: number; value: LiveStats };
}

interface GitHubRepo {
  name: string;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return (await response.json()) as T;
}

/** Repositories and the organisation totals derived from them, as the build derives them. */
async function loadStats(): Promise<LiveStats> {
  const repos = await getJson<GitHubRepo[]>(
    `${GITHUB_API}/orgs/${ORG}/repos?per_page=100&sort=pushed&type=public`,
  );
  const own = repos.filter((repo) => !repo.fork);
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;

  const byName: Record<string, LiveRepo> = {};
  for (const repo of own) {
    byName[repo.name] = {
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      pushedAt: repo.pushed_at ?? null,
    };
  }

  return {
    repos: byName,
    totals: {
      repos: own.length,
      stars: own.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0),
      forks: own.reduce((sum, repo) => sum + (repo.forks_count ?? 0), 0),
      activeRepos: own.filter((repo) => repo.pushed_at && Date.parse(repo.pushed_at) > cutoff).length,
    },
  };
}

const iso = (value: string) => new Date(value).toISOString();

/** Text for one `data-live` target, or null to leave the built value in place. */
function textFor(
  key: string,
  format: string | undefined,
  scope: string | null,
  stats: LiveStats | undefined,
): { text: string; stamp?: string } | null {
  const numeric = (value: number) => (format === 'compact' ? formatCompact(value) : formatNumber(value));

  if (scope) {
    const repo = stats?.repos[scope];
    if (!repo) return null;
    switch (key) {
      case 'stars':
        return { text: numeric(repo.stars) };
      case 'forks':
        return { text: numeric(repo.forks) };
      case 'pushed':
        return repo.pushedAt ? { text: formatDate(repo.pushedAt), stamp: iso(repo.pushedAt) } : null;
      case 'updated':
        return repo.pushedAt ? { text: formatRelative(repo.pushedAt), stamp: iso(repo.pushedAt) } : null;
      default:
        return null;
    }
  }

  const totals = stats?.totals;
  switch (key) {
    case 'repos':
      return totals ? { text: numeric(totals.repos) } : null;
    case 'stars':
      return totals ? { text: numeric(totals.stars) } : null;
    case 'forks':
      return totals ? { text: numeric(totals.forks) } : null;
    case 'active-repos':
      return totals ? { text: numeric(totals.activeRepos) } : null;
    default:
      return null;
  }
}

/** Stamp the status line after a successful refresh; failure leaves the built text. */
function markStatus(at: number) {
  const age = Date.now() - at < JUST_NOW_MS ? 'just now' : formatRelative(new Date(at));
  for (const node of document.querySelectorAll<HTMLElement>('[data-live-status]')) {
    node.dataset.state = 'live';
    node.textContent = `Live · updated ${age}`;
  }
}

function readCache(): Cache {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Cache) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Private mode and quota errors are not worth a fallback: the page is fine.
  }
}

async function run() {
  const nodes = [...document.querySelectorAll<HTMLElement>('[data-live]')];
  if (nodes.length === 0) return;
  if (navigator.onLine === false) return;

  const cache = readCache();
  let latest = 0;
  let live: LiveStats | undefined;

  if (cache.stats && Date.now() - cache.stats.at < CACHE_TTL_MS) {
    live = cache.stats.value;
    latest = cache.stats.at;
  } else {
    try {
      live = await loadStats();
      const entry = { at: Date.now(), value: live };
      writeCache({ stats: entry });
      latest = entry.at;
    } catch (error) {
      // Offline, rate limited, blocked, API down: the built numbers stand.
      console.debug('[live] keeping the built numbers:', error);
    }
  }

  for (const node of nodes) {
    const [key, format] = (node.dataset.live ?? '').split(':');
    const scope = node.closest<HTMLElement>('[data-repo]')?.dataset.repo ?? null;
    const resolved = textFor(key, format, scope, live);
    if (!resolved) continue;
    node.textContent = resolved.text;
    if (resolved.stamp && node instanceof HTMLTimeElement) node.dateTime = resolved.stamp;
  }

  if (live) markStatus(latest);
}

/**
 * The router fires `astro:page-load` on the first load and after every swap, so
 * that is what re-runs the refresh: a swapped-in page is built HTML whose numbers
 * have not been looked up yet. The DOMContentLoaded branch is the fallback for a
 * router that never started, and `started` keys on the URL so the first load,
 * which both triggers can reach, fetches once.
 */
let started = '';

const boot = () => {
  const here = `${location.pathname}${location.search}`;
  if (started === here) return;
  started = here;
  void run();
};

document.addEventListener('astro:page-load', boot);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
