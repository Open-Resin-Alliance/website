/**
 * Browser refresh of what a page was built with.
 *
 * The site is static: without JavaScript every value comes from the committed
 * snapshots in `src/data/`, and that stays true whenever the APIs cannot be
 * reached - offline, rate limited, blocked, or down. This module only ever
 * improves on those values; it never blanks one out or shows an error, so the
 * page a visitor gets is the page that was built, optionally with fresher data.
 *
 * Two calls per page, no token. GitHub is one request for the whole org, so
 * anything that costs a call per repository stays snapshot-only - open issue,
 * pull request and commit counts, contributor totals, per-release tags. Open
 * Collective answers a public GraphQL query with `access-control-allow-origin: *`,
 * which is what lets the browser read the collective directly. Both results are
 * reused for five minutes across pages.
 *
 * The numbers are text swaps (`data-live`); the backer cards are a list rebuild
 * (`data-live-list`), because a new backer is a new element, not a new string.
 */
import { ORG } from '../data/site';
import { formatCompact, formatDate, formatNumber, formatRelative } from './format';

const GITHUB_API = 'https://api.github.com';
const COLLECTIVE_API = 'https://api.opencollective.com/graphql/v2';
/** Same slug as scripts/fetch-open-collective.mjs, which cannot import a `.ts` module. */
const COLLECTIVE_SLUG = 'openresinalliance';
const COLLECTIVE_URL = `https://opencollective.com/${COLLECTIVE_SLUG}`;
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

/** One backer card: everything the built markup carries, and nothing else. */
interface LiveBacker {
  name: string;
  imageUrl: string | null;
  url: string | null;
}

/** A fetched payload with the moment it arrived, reused for five minutes. */
interface Cached<T> {
  at: number;
  value: T;
}

interface Cache {
  stats?: Cached<LiveStats>;
  supporters?: Cached<LiveBacker[]>;
}

interface GitHubRepo {
  name: string;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
}

interface CollectiveAccount {
  name?: string | null;
  slug?: string | null;
  website?: string | null;
  imageUrl?: string | null;
  isIncognito?: boolean;
}

interface CollectiveNode {
  isBacker?: boolean;
  account?: CollectiveAccount | null;
}

interface CollectivePayload {
  data?: {
    collective?: {
      contributors?: { nodes?: CollectiveNode[] } | null;
    } | null;
  } | null;
  errors?: Array<{ message: string }>;
}

/** Minimal query: the fields a backer card is built from, and nothing else. */
const BACKERS_QUERY = `query Backers($slug: String!) {
  collective(slug: $slug) {
    contributors(limit: 100) {
      nodes { isBacker account { name slug website imageUrl isIncognito } }
    }
  }
}`;

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return (await response.json()) as T;
}

/** Reuse a result from the last five minutes, otherwise fetch it. */
async function cached<T>(entry: Cached<T> | undefined, load: () => Promise<T>): Promise<Cached<T> | undefined> {
  if (entry && Date.now() - entry.at < CACHE_TTL_MS) return entry;
  try {
    return { at: Date.now(), value: await load() };
  } catch (error) {
    // Offline, rate limited, blocked, API down: the built markup stands.
    console.debug('[live] keeping the built values:', error);
    return undefined;
  }
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

/**
 * Same filter as scripts/fetch-open-collective.mjs: backers only, and an incognito
 * account is never published. The order is the collective's own, so the list is
 * not re-sorted here - a refresh should not reshuffle what the page already shows.
 */
async function loadBackers(): Promise<LiveBacker[]> {
  const payload = await getJson<CollectivePayload>(COLLECTIVE_API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ query: BACKERS_QUERY, variables: { slug: COLLECTIVE_SLUG } }),
  });
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join('; '));

  const backers: LiveBacker[] = [];
  for (const node of payload.data?.collective?.contributors?.nodes ?? []) {
    const account = node.account;
    if (!node.isBacker || !account?.name || account.isIncognito) continue;
    backers.push({
      name: account.name,
      imageUrl: account.imageUrl ?? null,
      url: account.website ?? (account.slug ? `https://opencollective.com/${account.slug}` : null),
    });
  }
  return backers;
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

/**
 * Rebuild the backer cards with the markup the page was built from - avatar,
 * name, profile link - so a refresh is indistinguishable from a rebuild. An empty
 * answer leaves the list alone: blanking the section would read as "no backers".
 */
function renderBackers(list: HTMLElement, backers: LiveBacker[]) {
  if (backers.length === 0) return;

  // Astro scopes the page's styles to a `data-astro-cid-*` attribute. The
  // server-rendered cards carry it and a client-created one does not, which costs
  // the card its pane and its layout, so the list's own attributes are copied onto
  // everything built here.
  const scope = [...list.attributes].filter((attribute) => attribute.name.startsWith('data-astro-cid-'));

  const stamped = <T extends HTMLElement>(element: T): T => {
    for (const attribute of scope) element.setAttribute(attribute.name, attribute.value);
    return element;
  };

  list.replaceChildren(
    ...backers.map((backer) => {
      const item = stamped(document.createElement('li'));
      const link = stamped(document.createElement('a'));
      link.href = backer.url ?? COLLECTIVE_URL;
      link.rel = 'noopener noreferrer';
      link.target = '_blank';

      if (backer.imageUrl) {
        const avatar = stamped(document.createElement('img'));
        avatar.src = backer.imageUrl;
        avatar.alt = '';
        avatar.width = 32;
        avatar.height = 32;
        avatar.loading = 'lazy';
        avatar.decoding = 'async';
        link.append(avatar);
      }

      const box = stamped(document.createElement('span'));
      const name = stamped(document.createElement('strong'));
      name.textContent = backer.name;
      box.append(name);
      link.append(box);
      item.append(link);
      return item;
    }),
  );
}

/**
 * Stamp the status line after a successful refresh; failure leaves the built text
 * in place. The words are deliberately bare - "updated just now" next to the
 * footer's GitHub link, not a badge announcing itself.
 */
function markStatus(at: number) {
  const age = Date.now() - at < JUST_NOW_MS ? 'just now' : formatRelative(new Date(at));
  for (const node of document.querySelectorAll<HTMLElement>('[data-live-status]')) {
    node.textContent = `updated ${age}`;
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
  const lists = [...document.querySelectorAll<HTMLElement>('[data-live-list]')];
  if (nodes.length === 0 && lists.length === 0) return;
  if (navigator.onLine === false) return;

  // Only what this page shows is fetched: a page with numbers and no backer cards
  // does not ask Open Collective anything.
  const cache = readCache();
  const [statsEntry, backersEntry] = await Promise.all([
    nodes.length > 0 ? cached(cache.stats, loadStats) : undefined,
    lists.length > 0 ? cached(cache.supporters, loadBackers) : undefined,
  ]);

  if (statsEntry) cache.stats = statsEntry;
  if (backersEntry) cache.supporters = backersEntry;
  if (statsEntry || backersEntry) writeCache(cache);

  let applied = false;

  for (const node of nodes) {
    const [key, format] = (node.dataset.live ?? '').split(':');
    const scope = node.closest<HTMLElement>('[data-repo]')?.dataset.repo ?? null;
    const resolved = textFor(key, format, scope, statsEntry?.value);
    if (!resolved) continue;
    node.textContent = resolved.text;
    if (resolved.stamp && node instanceof HTMLTimeElement) node.dateTime = resolved.stamp;
    applied = true;
  }

  if (backersEntry) {
    for (const list of lists) renderBackers(list, backersEntry.value);
    applied = true;
  }

  if (applied) markStatus(Math.max(statsEntry?.at ?? 0, backersEntry?.at ?? 0));
}

/**
 * The router fires `astro:page-load` on the first load and after every swap, so
 * that is what re-runs the refresh: a swapped-in page is built HTML whose values
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
