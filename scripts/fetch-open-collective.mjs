#!/usr/bin/env node
/**
 * Build-time Open Collective pipeline.
 *
 * Writes src/data/supporters.json from the public Open Collective GraphQL API,
 * so the supporters block reflects who actually funds the work right now rather
 * than a hand-maintained list of logos that goes stale.
 *
 * Usage:
 *   node scripts/fetch-open-collective.mjs           # refresh the snapshot
 *   node scripts/fetch-open-collective.mjs --offline # print the committed snapshot
 *
 * No credentials are needed: the collective, its contributors and their avatars
 * are public. Set OPEN_COLLECTIVE_TOKEN to raise the API rate limit.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SLUG = 'openresinalliance';
const OUT = resolve(fileURLToPath(new URL('../src/data/supporters.json', import.meta.url)));
const API = 'https://api.opencollective.com/graphql/v2';

const QUERY = `
  query Collective($slug: String!) {
    collective(slug: $slug) {
      name
      slug
      imageUrl
      website
      totalFinancialContributors
      orders(limit: 100, status: ACTIVE) {
        nodes {
          frequency
          totalAmount { value currency }
          fromAccount { slug isIncognito }
        }
      }
      contributors(limit: 100) {
        totalCount
        nodes {
          roles
          isBacker
          isCore
          since
          totalAmountContributed { value currency }
          account { name slug type imageUrl website isIncognito }
        }
      }
    }
  }
`;

const FREQUENCY_LABELS = {
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  FLEXIBLE: 'Recurring',
  ONE_TIME: 'One-time',
};

/** Human label for an order frequency, defaulting to the raw value if unknown. */
function frequencyLabel(value) {
  if (!value) return FREQUENCY_LABELS.ONE_TIME;
  return FREQUENCY_LABELS[value] ?? value;
}

function accountUrl(account) {
  if (account.website) return account.website;
  return account.slug ? `https://opencollective.com/${account.slug}` : null;
}

/** Public profile of a backer. Incognito accounts are dropped, never published. */
function normaliseAccount(account) {
  return {
    name: account.name ?? null,
    slug: account.slug ?? null,
    type: account.type ?? null,
    imageUrl: account.imageUrl ?? null,
    url: accountUrl(account),
  };
}

async function collect() {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      // The API rejects requests without a JSON content type as suspected CSRF.
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'openresin.org-supporters',
      ...(process.env.OPEN_COLLECTIVE_TOKEN
        ? { authorization: `Bearer ${process.env.OPEN_COLLECTIVE_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ query: QUERY, variables: { slug: SLUG } }),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} - ${(await res.text()).slice(0, 200)}`);
  }

  const payload = await res.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join('; '));
  }

  const collective = payload.data?.collective;
  if (!collective) throw new Error(`no collective returned for slug "${SLUG}"`);

  const nodes = collective.contributors?.nodes ?? [];

  // An active order is an in-force subscription; anything else a backer has paid
  // was a one-time contribution. Keyed by account slug because that is the only
  // identifier both queries share.
  const activeOrders = new Map(
    (collective.orders?.nodes ?? [])
      .filter((order) => order.fromAccount?.slug && !order.fromAccount.isIncognito)
      .map((order) => [
        order.fromAccount.slug,
        {
          frequency: order.frequency,
          label: frequencyLabel(order.frequency),
          amount: order.totalAmount?.value ?? 0,
          currency: order.totalAmount?.currency ?? 'USD',
        },
      ]),
  );

  const backers = nodes
    .filter((node) => node.isBacker && !node.account?.isIncognito)
    .map((node) => {
      const recurring = activeOrders.get(node.account?.slug) ?? null;
      return {
        ...normaliseAccount(node.account),
        since: node.since ?? null,
        amount: node.totalAmountContributed?.value ?? 0,
        currency: node.totalAmountContributed?.currency ?? 'USD',
        recurring: recurring !== null,
        frequency: recurring?.frequency ?? 'ONE_TIME',
        frequencyLabel: recurring?.label ?? FREQUENCY_LABELS.ONE_TIME,
        recurringAmount: recurring?.amount ?? null,
      };
    })
    .sort((a, b) => {
      // Recurring backers first, then by contribution, then by name.
      if (a.recurring !== b.recurring) return a.recurring ? -1 : 1;
      return b.amount - a.amount || (a.name ?? '').localeCompare(b.name ?? '');
    });

  const host = nodes.find((node) => node.roles?.includes('HOST') && node.account && !node.account.isIncognito);

  const currency = backers[0]?.currency ?? 'USD';
  const raised = backers.reduce((sum, backer) => sum + (backer.amount ?? 0), 0);

  return {
    generatedAt: new Date().toISOString(),
    source: API,
    collective: {
      name: collective.name,
      slug: collective.slug,
      imageUrl: collective.imageUrl ?? null,
      website: collective.website ?? null,
      url: `https://opencollective.com/${collective.slug}`,
      totalFinancialContributors: collective.totalFinancialContributors ?? backers.length,
    },
    host: host ? normaliseAccount(host.account) : null,
    totals: {
      backers: backers.length,
      contributors: collective.contributors?.totalCount ?? nodes.length,
      raised: Math.round(raised * 100) / 100,
      currency,
    },
    backers,
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
  const { collective, totals, host } = snapshot;
  console.log(`snapshot generatedAt ${snapshot.generatedAt}`);
  console.log(`collective ${collective.name} (${collective.slug}) - ${collective.url}`);
  console.log(`totals     ${totals.backers} backers, ${totals.contributors} contributors, ${totals.raised} ${totals.currency} raised`);
  console.log(`fiscal host ${host ? host.name : 'none reported'}`);
  for (const backer of snapshot.backers) {
    const amount = String(backer.amount).padStart(8);
    const kind = String(backer.frequencyLabel ?? '?').padEnd(9);
    const monthly = backer.recurringAmount ? ` (${backer.recurringAmount}/mo)` : '';
    console.log(`  ${amount} ${backer.currency} ${kind} ${backer.name}${monthly}`);
  }
}

const offline = process.argv.includes('--offline');

if (offline) {
  const existing = await readExisting();
  if (!existing) {
    console.error(`no snapshot at ${OUT} - run without --offline first`);
    process.exit(1);
  }
  printSummary(existing);
  const ageHours = (Date.now() - Date.parse(existing.generatedAt)) / 3_600_000;
  console.log(`age        ${ageHours.toFixed(1)} hours`);
  process.exit(0);
}

const previous = await readExisting();

let snapshot;
try {
  snapshot = await collect();
} catch (error) {
  console.error(`supporters refresh failed: ${error.message ?? error}`);
  if (previous) {
    console.error('keeping the existing snapshot; the build will use stale-but-valid data');
    printSummary(previous);
    process.exit(0);
  }
  console.error('no existing snapshot to fall back on - failing');
  process.exit(1);
}

if (!snapshot.backers.length && previous?.backers?.length) {
  console.error('API returned no backers; keeping the existing snapshot rather than blanking the page');
  printSummary(previous);
  process.exit(0);
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
printSummary(snapshot);
console.log(`wrote ${OUT}`);
