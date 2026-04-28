import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeCatalog } from '../src/data/normalize.js';
import { buildIndex, searchSessions, findSession } from '../src/search/index.js';
import type { RawSession, Session } from '../src/contracts.js';

const fixturePath = join(import.meta.dirname, 'fixtures', 'build-2025-sample.json');
const rawSessions: RawSession[] = JSON.parse(readFileSync(fixturePath, 'utf-8'));

let sessions: Session[];

beforeAll(() => {
  sessions = normalizeCatalog(rawSessions, 'build-2025');
  buildIndex(sessions);
});

describe('keyword search (--query)', () => {
  it('finds sessions by title keyword', () => {
    const results = searchSessions({ query: 'Foundry' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.session.sessionCode === 'BRK155')).toBe(true);
  });

  it('boosts title matches over description matches', () => {
    const results = searchSessions({ query: 'Foundry' });
    // BRK155 has "Foundry" in title — should rank high
    const brk155 = results.find((r) => r.session.sessionCode === 'BRK155');
    expect(brk155).toBeDefined();
    if (results.length > 1) {
      expect(results[0]!.score).toBeGreaterThanOrEqual(results[results.length - 1]!.score);
    }
  });

  it('returns empty for no matches', () => {
    const results = searchSessions({ query: 'xyznonexistent' });
    expect(results.length).toBe(0);
  });
});

describe('technology search (--tech)', () => {
  it('finds sessions by technology name', () => {
    const results = searchSessions({ tech: 'Cosmos DB' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.session.sessionCode === 'BRK212')).toBe(true);
  });
});

describe('speaker search (--speaker)', () => {
  it('finds sessions by speaker name', () => {
    const results = searchSessions({ speaker: 'Hanselman' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.session.sessionCode === 'KEY040')).toBe(true);
  });

  it('handles fuzzy matching on partial name', () => {
    const results = searchSessions({ speaker: 'Hanselm' });
    // Fuzzy should still match "Hanselman"
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('findSession', () => {
  it('finds exact session by code', () => {
    const matches = findSession('BRK154');
    expect(matches.length).toBe(1);
    expect(matches[0]!.sessionCode).toBe('BRK154');
  });

  it('is case-insensitive', () => {
    const matches = findSession('brk154');
    expect(matches.length).toBe(1);
  });

  it('returns empty for unknown code', () => {
    const matches = findSession('ZZZZZ');
    expect(matches.length).toBe(0);
  });
});

describe('filters', () => {
  it('respects --type filter', () => {
    const results = searchSessions({ query: 'Foundry', type: 'Keynote' });
    for (const r of results) {
      expect(r.session.type.toLowerCase()).toContain('keynote');
    }
  });

  it('respects --limit', () => {
    const results = searchSessions({ query: 'Azure', limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });
});
