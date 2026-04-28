import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import envPaths from 'env-paths';
import type { Session, CacheMeta, EventConfig } from '../contracts.js';
import { KNOWN_EVENTS } from '../config.js';
import { FetchError } from '../errors.js';
import { normalizeCatalog } from './normalize.js';

const paths = envPaths('msevents', { suffix: '' });

function cacheDir(): string {
  return paths.cache;
}

function sessionsPath(eventId: string): string {
  return join(cacheDir(), `${eventId}-sessions.json`);
}

function metaPath(eventId: string): string {
  return join(cacheDir(), `${eventId}-meta.json`);
}

async function ensureCacheDir(): Promise<void> {
  await mkdir(cacheDir(), { recursive: true });
}

export async function readMeta(eventId: string): Promise<CacheMeta | null> {
  const path = metaPath(eventId);
  if (!existsSync(path)) return null;
  try {
    const data = JSON.parse(await readFile(path, 'utf-8')) as CacheMeta;
    return data;
  } catch {
    return null;
  }
}

export async function readSessions(eventId: string): Promise<Session[]> {
  const path = sessionsPath(eventId);
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(await readFile(path, 'utf-8')) as Session[];
  } catch {
    return [];
  }
}

export async function fetchAndCache(event: EventConfig, force: boolean = false): Promise<Session[]> {
  await ensureCacheDir();

  const existingMeta = await readMeta(event.id);
  const headers: Record<string, string> = {};

  // Conditional GET if we have prior data and not forcing
  if (!force && existingMeta) {
    if (existingMeta.etag) headers['If-None-Match'] = existingMeta.etag;
    if (existingMeta.lastModified) headers['If-Modified-Since'] = existingMeta.lastModified;
  }

  let response: Response;
  try {
    response = await fetch(event.endpoint, { headers });
  } catch (err) {
    throw new FetchError(
      `Failed to reach ${event.endpoint}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // 304 Not Modified — cache is still fresh
  if (response.status === 304 && existingMeta) {
    const updatedMeta: CacheMeta = { ...existingMeta, fetchedAt: new Date().toISOString() };
    await writeFile(metaPath(event.id), JSON.stringify(updatedMeta, null, 2));
    return readSessions(event.id);
  }

  if (!response.ok) {
    throw new FetchError(
      `${event.endpoint} returned ${response.status}`,
      response.status,
    );
  }

  const raw = (await response.json()) as unknown[];
  const sessions = normalizeCatalog(raw, event.id);

  const meta: CacheMeta = {
    eventId: event.id,
    fetchedAt: new Date().toISOString(),
    sessionCount: sessions.length,
    etag: response.headers.get('etag') ?? undefined,
    lastModified: response.headers.get('last-modified') ?? undefined,
  };

  await writeFile(sessionsPath(event.id), JSON.stringify(sessions));
  await writeFile(metaPath(event.id), JSON.stringify(meta, null, 2));

  return sessions;
}

export async function getAllCachedSessions(): Promise<Session[]> {
  await ensureCacheDir();
  const all: Session[] = [];
  for (const event of KNOWN_EVENTS) {
    const sessions = await readSessions(event.id);
    all.push(...sessions);
  }
  return all;
}

export async function getCacheStatus(): Promise<Array<{ eventId: string; meta: CacheMeta | null }>> {
  const statuses = [];
  for (const event of KNOWN_EVENTS) {
    statuses.push({ eventId: event.id, meta: await readMeta(event.id) });
  }
  return statuses;
}
