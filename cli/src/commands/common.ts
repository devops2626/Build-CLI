import { KNOWN_EVENTS } from '../config.js';
import { getAllCachedSessions, fetchAndCache } from '../data/cache.js';

export async function ensureCache(): Promise<void> {
  const sessions = await getAllCachedSessions();
  if (sessions.length === 0) {
    process.stderr.write('No cached sessions. Fetching...\n');
    for (const event of KNOWN_EVENTS) {
      try {
        process.stderr.write(`  ${event.name}...`);
        const fetched = await fetchAndCache(event);
        process.stderr.write(` ${fetched.length} sessions.\n`);
      } catch {
        process.stderr.write(' unavailable.\n');
      }
    }
  }
}
