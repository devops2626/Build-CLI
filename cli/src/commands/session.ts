import { getAllCachedSessions } from '../data/cache.js';
import { buildIndex, findSession } from '../search/index.js';
import { formatSessionDetail } from '../output/format.js';
import { ensureCache } from './common.js';

export async function session(
  code: string,
  opts: { event?: string; json?: boolean },
): Promise<void> {
  await ensureCache();
  const all = await getAllCachedSessions();
  buildIndex(all);

  const matches = findSession(code, opts.event);
  console.log(formatSessionDetail(matches, opts.json ?? false));
}
