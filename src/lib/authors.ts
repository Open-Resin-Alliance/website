import { orgMember, verifiedContributor } from './stats';

export interface AuthorInput {
  name: string;
  github?: string;
  bio?: string;
  url?: string;
  email?: string;
  avatar?: string;
}

export interface ResolvedAuthor extends AuthorInput {
  /** URL-safe anchor ID for linking the header byline to the bottom bio card. */
  slug: string;
  /** True when the author's GitHub handle appears in the synced Open-Resin-Alliance org members list. */
  orgVerified: boolean;
  /** True when the author's GitHub handle appears in the synced contributors list (flagship repos + website). */
  contributorVerified: boolean;
  /** GitHub profile URL, when `github` is set. */
  githubUrl: string | null;
  /** Resolved avatar URL (local override, synced GitHub avatar, GitHub username avatar, or null). */
  avatarUrl: string | null;
  /** Monogram fallback when no avatar image is available. */
  initials: string;
}

function sizedAvatar(url: string, size = 160): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}s=${size}`;
}

function slugFor(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'author'
  );
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function resolveAuthor(author: AuthorInput): ResolvedAuthor {
  const handle = author.github?.replace(/^@/, '').trim() || undefined;
  const member = handle ? orgMember(handle) : undefined;
  const contributor = handle ? verifiedContributor(handle) : undefined;
  const syncedAvatar = member?.avatarUrl ?? contributor?.avatarUrl ?? null;
  const githubAvatar = handle
    ? syncedAvatar
      ? sizedAvatar(syncedAvatar)
      : `https://github.com/${encodeURIComponent(handle)}.png?size=160`
    : null;

  return {
    ...author,
    github: handle,
    slug: slugFor(handle ?? author.name),
    orgVerified: Boolean(member),
    contributorVerified: Boolean(contributor),
    githubUrl: handle ? (member?.url ?? contributor?.url ?? `https://github.com/${handle}`) : null,
    avatarUrl: author.avatar ?? githubAvatar,
    initials: initialsFor(author.name),
  };
}

export function resolvePostAuthors(author?: AuthorInput | AuthorInput[]): ResolvedAuthor[] {
  if (!author) return [];
  const list = Array.isArray(author) ? author : [author];
  return list.map(resolveAuthor);
}
