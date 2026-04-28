# msevents CLI

Command-line tool for searching Microsoft flagship event sessions (Build, Ignite). Fetches the public session catalog, builds a local search index, and serves filtered results to agents or humans.

Named `msevents` (not `msbuild`) because it covers all Microsoft flagship events, matching the `microsoft-events` skill's year-round framing. Adding a new event is a config update, not a code change. Published as `@microsoft/events-cli` on npm, following the `@microsoft/learn-cli` pattern.

## Usage

```sh
# Run directly (no install needed)
npx @microsoft/events-cli sessions --query "Azure AI Foundry"

# Or install globally
npm install -g @microsoft/events-cli
msevents sessions --query "Azure AI Foundry"
```

## Commands

```sh
# Download and cache session catalogs
msevents refresh                          # all known events
msevents refresh --event build-2025       # just one

# Search sessions by keyword (searches across all fields, boosts title)
msevents sessions --query "agent orchestration"

# Search sessions by technology (matches product, tags, topic, languages)
msevents sessions --tech "Azure AI Foundry"
msevents sessions --tech "Azure Cosmos DB" --type lab

# Search sessions by speaker
msevents sessions --speaker "Scott Hanselman"

# Combine filters
msevents sessions --tech "Azure AI Foundry" --speaker "Yina Arenas"
msevents sessions --event build-2025 --query "Foundry"

# Get a specific session (searches all cached events, disambiguates on collision)
msevents session BRK155

# Show what's cached
msevents status
#   build-2025: 520 sessions, cached 2h ago
#   ignite-2025: 312 sessions, cached 3d ago
#   build-2026: endpoint not yet available
```

## Output

Human-readable text by default, `--json` for piping to agents or other tools.

```sh
msevents sessions --query "Foundry" --json
```

## Multi-event design

The session catalog endpoint follows a predictable pattern:

```
https://eventtools.event.microsoft.com/{event}{year}-prod/fallback/session-all-en-us.json
```

Known events:

| Event | Endpoint | Status |
|-------|----------|--------|
| Build 2025 | `build2025-prod` | Live, 520 sessions |
| Ignite 2025 | `ignite2025-prod` | Live, 1090 sessions |
| Build 2026 | `build2026-prod` | Live, 60 sessions |
| Ignite 2026 | `ignite2026-prod` | Not yet available |

The `--event` flag filters to a single event. Without it, commands search across everything cached. Adding a new event means adding its endpoint to the known events list.

## Behavior

- **Auto-refresh**: if the cache is empty on first search, the CLI fetches and caches automatically. No explicit `refresh` needed.
- **Cache TTL**: 24 hours. `refresh --force` bypasses. Uses conditional GET (ETag/Last-Modified) for cheap revalidation.
- **Session lookup**: `session BRK155` searches all cached events. If the code exists in multiple events, shows disambiguation.
- **Results**: 10 by default, `--limit` to override.

## Relationship to the skill

The `microsoft-events` skill is the reasoning layer — it decides when to activate, how to inventory the developer's project, and how to present results. The CLI is the data access layer — it handles fetching, caching, indexing, and searching.

The skill prefers the CLI when available and falls back to direct HTTP fetch when it's not. See the [data access investigation](../docs/data-access-investigation.md) for the full architecture analysis.

## Local development

```sh
cd cli
npm install
npm run build
npm test

# Run locally
node dist/index.js sessions --query "Azure AI Foundry"
node dist/index.js refresh
node dist/index.js status

# Link globally (makes `msevents` available everywhere, no npm publish needed)
npm link
msevents sessions --tech "Azure AI Foundry" --json

# Unlink when done
npm unlink -g @microsoft/events-cli
```

## Stack

Following the [mslearn CLI](https://github.com/MicrosoftDocs/mcp/tree/main/cli) pattern:

- TypeScript, Node.js 22+
- commander for argument parsing
- minisearch for local search index
- env-paths for XDG-compliant cache location
