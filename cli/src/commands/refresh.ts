import { KNOWN_EVENTS } from '../config.js';
import { fetchAndCache } from '../data/cache.js';
import { FetchError } from '../errors.js';

export async function refresh(eventFilter?: string, force: boolean = false): Promise<void> {
  const events = eventFilter
    ? KNOWN_EVENTS.filter((e) => e.id === eventFilter)
    : KNOWN_EVENTS;

  if (events.length === 0) {
    console.error(`Unknown event: ${eventFilter}`);
    console.error(`Known events: ${KNOWN_EVENTS.map((e) => e.id).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  for (const event of events) {
    try {
      process.stderr.write(`Fetching ${event.name}...`);
      const sessions = await fetchAndCache(event, force);
      process.stderr.write(` ${sessions.length} sessions cached.\n`);
    } catch (err) {
      if (err instanceof FetchError) {
        process.stderr.write(` failed: ${err.message}\n`);
      } else {
        throw err;
      }
    }
  }
}
