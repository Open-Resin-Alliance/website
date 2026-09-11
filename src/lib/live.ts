/**
 * Browser refresh of the numbers a page was built with.
 *
 * The site is static: without JavaScript every value comes from the committed
 * snapshots in `src/data/`, and that stays true whenever the APIs cannot be
 * reached — offline, rate limited, blocked, or down. This module only ever
 * improves on those numbers; it never blanks one out or shows an error, so the
 * page a visitor gets is the page that was built, optionally with fresher data.
 *
 * One GitHub call and one Open Collective call per page, no token: an
 * unauthenticated browser gets 60 GitHub requests per hour per IP, so anything
 * that costs a call per repository stays snapshot-only — open issue, pull
 * request and commit counts, contributor totals, per-release tags — and every
 * result is reused for five minutes across pages.
 */
import { COLLECTIVE_SLUG, ORG } from '../data/site';
import { formatAmount, formatCompact, formatDate, formatNumber, formatRelative } from './format';

const GITHUB_API = 'https://api.github.com';
const COLLECTIVE_API = 'https://api.opencollective.com/graphql/v2';
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

interface LiveSupporters {
  backers: number;
  raised: number;
  currency: string;
}

interface Sources {
  stats?: LiveStats;
  supporters?: LiveSupporters;
}

/** One fetched payload with the moment it arrived. */
interface Cached<T> {
  at: number;
  value: T;
}

interface Cache {
  stats?: Cached<LiveStats>;
  supporters?: Cached<LiveSupporters>;
}

interface GitHubRepo {
  name: string;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
}

interface CollectiveNode {
  isBacker?: boolean;
  totalAmountContributed?: { value?: number; currency?: string } | null;
  account?: { slug?: string; isIncognito?: boolean } | null;
}

interface CollectivePayload {
  data?: {
    collective?: {
      contributors?: { nodes?: CollectiveNode[] } | null;
    } | null;
  } | null;
  errors?: Array<{ message: string }>;
}

/** Minimal query: only what the two numbers on the page are derived from. */
const SUPPORTERS_QUERY = `query Backers($slug: String!) {
  collective(slug: $slug) {
    contributors(limit: 100) {
      nodes { isBacker totalAmountContributed { value currency } account { slug isIncognito } }
    }
  }
}`;

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

/** Same arithmetic as scripts/fetch-open-collective.mjs: backers pay, incognito never counts. */
async function loadSupporters(): Promise<LiveSupporters> {
  const payload = await getJson<CollectivePayload>(COLLECTIVE_API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ query: SUPPORTERS_QUERY, variables: { slug: COLLECTIVE_SLUG } }),
  });
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join('; '));

  const nodes = payload.data?.collective?.contributors?.nodes ?? [];
  const backers = nodes.filter((node) => node.isBacker && !node.account?.isIncognito);
  const raised = backers.reduce((sum, node) => sum + (node.totalAmountContributed?.value ?? 0), 0);

  return {
    backers: backers.length,
    raised: Math.round(raised * 100) / 100,
    currency: backers[0]?.totalAmountContributed?.currency ?? 'USD',
  };
}

const iso = (value: string) => new Date(value).toISOString();

/** Text for one `data-live` target, or null to leave the built value in place. */
function textFor(
  key: string,
  format: string | undefined,
  scope: string | null,
  sources: Sources,
): { text: string; stamp?: string } | null {
  const numeric = (value: number) => (format === 'compact' ? formatCompact(value) : formatNumber(value));

  if (scope) {
    const repo = sources.stats?.repos[scope];
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

  const totals = sources.stats?.totals;
  switch (key) {
    case 'repos':
      return totals ? { text: numeric(totals.repos) } : null;
    case 'stars':
      return totals ? { text: numeric(totals.stars) } : null;
    case 'forks':
      return totals ? { text: numeric(totals.forks) } : null;
    case 'active-repos':
      return totals ? { text: numeric(totals.activeRepos) } : null;
    case 'backers':
      return sources.supporters ? { text: numeric(sources.supporters.backers) } : null;
    case 'raised':
      return sources.supporters
        ? { text: formatAmount(sources.supporters.raised, sources.supporters.currency) }
        : null;
    default:
      return null;
  }
}


function markStatus(state: 'live' | 'partial' | 'snapshot', at: number) {
  if (state === 'snapshot') return;
  const age = Date.now() - at < JUST_NOW_MS ? 'just now' : formatRelative(new Date(at));
  const label = state === 'live' ? 'Live' : 'Partly live';
  for (const node of document.querySelectorAll<HTMLElement>('[data-live-status]')) {
    node.dataset.state = state;
    node.textContent = `${label} · updated ${age}`;
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

  const keyOf = (node: HTMLElement) => (node.dataset.live ?? '').split(':')[0];
  const wantsStats = nodes.some((node) => !['backers', 'raised'].includes(keyOf(node)));
  const wantsSupporters = nodes.some((node) => ['backers', 'raised'].includes(keyOf(node)));

  const cache = readCache();
  const sources: Sources = {};
  const tasks: Promise<void>[] = [];
  let applied = 0;
  let failed = 0;
  let latest = 0;

  const accept = <T>(entry: Cached<T>, take: (value: T) => void) => {
    take(entry.value);
    applied += 1;
    latest = Math.max(latest, entry.at);
  };

  /** Reuse a recent result, otherwise fetch; a failed fetch keeps the built values. */
  const load = <T>(cached: Cached<T> | undefined, fetchValue: () => Promise<T>, take: (value: T) => void, keep: (entry: Cached<T>) => void) => {
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      accept(cached, take);
      return;
    }
    tasks.push(
      fetchValue().then(
        (value) => {
          const entry = { at: Date.now(), value };
          keep(entry);
          accept(entry, take);
        },
        (error: unknown) => {
          failed += 1;
          console.debug('[live] keeping the built numbers:', error);
        },
      ),
    );
  };

  if (wantsStats) {
    load(
      cache.stats,
      loadStats,
      (value) => {
        sources.stats = value;
      },
      (entry) => {
        cache.stats = entry;
      },
    );
  }
  if (wantsSupporters) {
    load(
      cache.supporters,
      loadSupporters,
      (value) => {
        sources.supporters = value;
      },
      (entry) => {
        cache.supporters = entry;
      },
    );
  }
  if (tasks.length > 0) {
    await Promise.all(tasks);
    writeCache(cache);
  }

  for (const node of nodes) {
    const [key, format] = (node.dataset.live ?? '').split(':');
    const scope = node.closest<HTMLElement>('[data-repo]')?.dataset.repo ?? null;
    const resolved = textFor(key, format, scope, sources);
    if (!resolved) continue;
    node.textContent = resolved.text;
    if (resolved.stamp && node instanceof HTMLTimeElement) node.dateTime = resolved.stamp;
  }

  const state = failed === 0 && applied > 0 ? 'live' : applied > 0 ? 'partial' : 'snapshot';
  markStatus(state, latest || Date.now());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void run(), { once: true });
} else {
  void run();
}
