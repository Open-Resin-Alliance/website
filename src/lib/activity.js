/**
 * GitHub org events -> the activity entries the feed renders.
 *
 * Shared on purpose: `scripts/fetch-github-stats.mjs` bakes the feed into the
 * built HTML, and the browser refresh in `src/lib/live.ts` re-renders it from a
 * freshly fetched event list. One mapping means a refreshed feed has exactly the
 * shape of the one that was built, titles included.
 *
 * @typedef {object} ActivityEntry
 * @property {string|null} repo
 * @property {string} date ISO timestamp of the event
 * @property {string|null} actor
 * @property {string|null} avatar
 * @property {'release'|'push'|'create'|'pull_request'|'issue'|'public'} kind
 * @property {string} title
 * @property {string|null} url
 * @property {number} [burst] consecutive pushes collapsed into this entry
 */

/** Entries the snapshot keeps. The feed itself shows a slice per column. */
export const ACTIVITY_LIMIT = 24;

/**
 * How many of the newest events take part in burst collapsing before the feed is
 * trimmed, so a repo's run of pushes cannot crowd out everything else.
 */
const COLLAPSE_WINDOW = 40;

/**
 * @param {any} event raw GitHub org event
 * @returns {ActivityEntry|null}
 */
function mapEvent(event) {
  const repo = event.repo?.name?.split('/')[1] ?? null;
  const date = event.created_at ? String(event.created_at) : null;
  const base = { repo, date, actor: event.actor?.login ?? null, avatar: event.actor?.avatar_url ?? null };

  switch (event.type) {
    case 'ReleaseEvent':
      return {
        ...base,
        kind: 'release',
        title: `released ${event.payload?.release?.tag_name ?? ''}`.trim(),
        url: event.payload?.release?.html_url ?? null,
      };
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
      return {
        ...base,
        kind: 'pull_request',
        title: `${event.payload?.action ?? 'updated'} pull request #${event.payload?.number ?? ''}`.trim(),
        url: event.payload?.pull_request?.html_url ?? null,
      };
    case 'IssuesEvent':
      return {
        ...base,
        kind: 'issue',
        title: `${event.payload?.action ?? 'updated'} issue #${event.payload?.issue?.number ?? ''}`.trim(),
        url: event.payload?.issue?.html_url ?? null,
      };
    case 'PublicEvent':
      return {
        ...base,
        kind: 'public',
        title: 'made the repository public',
        url: `https://github.com/${event.repo?.name}`,
      };
    default:
      return null;
  }
}

/**
 * Newest first, at most `limit` entries, consecutive pushes to the same repo
 * collapsed into one entry carrying a `burst` count.
 *
 * @param {any[]} events raw GitHub org events
 * @param {{ limit?: number }} [options]
 * @returns {ActivityEntry[]}
 */
export function mapActivity(events, { limit = ACTIVITY_LIMIT } = {}) {
  /** @type {ActivityEntry[]} */
  const entries = [];
  for (const event of events) {
    const entry = mapEvent(event);
    if (entry?.date) entries.push(entry);
  }
  entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  /** @type {ActivityEntry[]} */
  const feed = [];
  for (const entry of entries.slice(0, COLLAPSE_WINDOW)) {
    const previous = feed.at(-1);
    if (previous && previous.kind === 'push' && entry.kind === 'push' && previous.repo === entry.repo) {
      previous.burst = (previous.burst ?? 1) + 1;
      continue;
    }
    if (feed.length === limit) break;
    feed.push(entry);
  }
  return feed;
}
