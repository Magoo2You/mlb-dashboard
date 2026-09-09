# Multi-sport architecture foundation

## Goal

Keep the existing MLB experience working while making future sports additive. The
foundation defines provider-neutral concepts and a registry, but it does not
claim that NFL, NBA, or NHL data is available.

## Boundaries

- **UI/application layer:** selects a sport, reads registry capabilities, and
  renders loading, empty, stale, or error states. It must not know provider URL
  shapes or sport-specific scoring rules.
- **Normalized domain layer (`src/domain/sports.ts`):** owns shared concepts
  such as teams, players, games, standings, news, availability, and capability
  flags. Fields stay generic; sport-specific metrics belong in future extensions
  or adapter-owned payloads.
- **Sport adapter layer:** translates one provider into normalized domain values.
  An adapter owns authentication, endpoints, pagination, rate limits, retries,
  provider IDs, and sport rules. It may expose only the capabilities it can
  prove and support.
- **Registry (`src/domain/sport-registry.ts`):** is the single discovery point
  for supported/planned sports. Consumers should gate navigation and requests
  using `availability` and `capabilities`, rather than assuming every sport is
  implemented.

The current `mlbAdapter` is a supported registry descriptor for the existing MLB
service layer; it intentionally does not duplicate that layer. NFL, NBA, and NHL
have experimental registry entries with every UI capability disabled. NBA also has
an ESPN current-scoreboard adapter foundation, but it is not UI-wired and its date
query behavior is unverified; the registry entry remains status-only.

## Phased provider strategy

1. **Foundation (now):** stabilize normalized contracts, explicit capability
   flags, and registry-driven availability. No new provider dependency.
2. **MLB boundary:** gradually map existing MLB responses behind an adapter while
   preserving current UI behavior. Add fixtures and contract tests for each
   normalized resource before changing consumers.
3. **One sport at a time:** for each planned sport, evaluate provider terms,
   coverage, freshness, rate limits, and reliability. Keep an adapter disabled
   until read-only schedule/score fixtures pass schema, identity, and freshness
   checks.
4. **Capability-led rollout:** implement the smallest useful vertical slice
   (usually schedule and scores), then standings, teams/players, play-by-play,
   news, and highlights independently. Enable each flag only after its adapter
   and verification coverage exist.
5. **Provider resilience:** keep provider-specific code isolated so a provider
   replacement changes an adapter, not the domain contracts or UI. Prefer
   explicit stale/error states over synthetic fallback data.

No NFL or NHL provider data is mounted in the UI. NBA's ESPN adapter is an
experimental current-scoreboard foundation only; it is not a live playable sport,
and no date-query support is claimed.
