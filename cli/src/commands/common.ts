import { KNOWN_EVENTS } from '../config.js';
import {
  fetchAndCache,
  isCacheCheckDue,
  readMeta,
  readSessions,
  recordFailedCheck,
} from '../data/cache.js';
import { FetchError } from '../errors.js';

export async function ensureCache(): Promise<void> {
  let missingCacheHeaderPrinted = false;

  for (const event of KNOWN_EVENTS) {
    const cachedSessions = await readSessions(event.id);
    const meta = await readMeta(event.id);
    const isMissingCache = cachedSessions.length === 0;

    if (!isMissingCache && !isCacheCheckDue(meta)) {
      continue;
    }

    try {
      if (isMissingCache) {
        if (!missingCacheHeaderPrinted) {
          process.stderr.write('Fetching missing session caches...\n');
          missingCacheHeaderPrinted = true;
        }
        process.stderr.write(`  ${event.name}...`);
      }

      const fetched = await fetchAndCache(event);
      if (isMissingCache) {
        process.stderr.write(` ${fetched.length} sessions.\n`);
      }
    } catch (err) {
      if (!(err instanceof FetchError)) {
        throw err;
      }

      if (isMissingCache) {
        process.stderr.write(` unavailable: ${err.message}\n`);
      } else {
        await recordFailedCheck(event.id);
        process.stderr.write(`Could not refresh ${event.name}; using cached sessions.\n`);
      }
    }
  }
}
