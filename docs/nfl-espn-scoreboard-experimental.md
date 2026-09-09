# NFL ESPN scoreboard adapter (experimental)

This repository contains a **read-only, experimental NFL adapter foundation**.
It is intentionally not registered in `src/domain/sport-registry.ts` and is not
wired into the UI. It never falls back to mock, MLB, or synthetic data: provider
errors are surfaced and malformed provider records are omitted from normalization.

## Provider surface

- Exact endpoint: `GET https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`
- Current scoreboard: request the exact endpoint with no query string.
- Date scoreboard: append `?dates=YYYYMMDD`, for example
  `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=20260908`.
- The adapter sends `Accept: application/json` and no API key, cookies, or other
  credentials. The endpoint was observed to return HTTP 200 without authentication
  from this environment on September 8, 2026; this is an observation, not a
  provider guarantee.

## Implemented boundary

- Strictly validates optional dates as real `YYYY-MM-DD` calendar dates.
- Applies a 10-second abort timeout and reports timeout/network failures,
  non-2xx HTTP responses, and invalid JSON as `NflApiError` instances.
- Normalizes ESPN events into the shared `NormalizedGame` contract where event
  ID, time, both home/away teams, and team names are present.
- Maps `pre`, `in`, and completed/`post` status values to shared scheduled/live/final
  states; explicitly maps postponed/canceled status names when ESPN supplies them.
- Exposes only read methods (`getScoreboard` and date-based `getSchedule`).
- `runNflNormalizationChecks` is deterministic and pure; it uses an in-memory
  fixture and never calls ESPN. Builds do not call the provider.

## Explicit limitations

- ESPN's site endpoint is public and undocumented as a third-party API. Schema,
  availability, rate limits, coverage, and terms may change without notice.
- No authentication, retries, caching, persistence, standings, rosters, play-by-play,
  news, highlights, polling policy, or rate-limit coordination is implemented.
- Provider records missing required identity/time/home/away fields are omitted;
  no replacement data is synthesized.
- The shared contract has only generic game states and scores; it does not preserve
  all NFL-specific status detail, possession, quarter, drive, odds, broadcasts,
  injuries, or competition metadata.
- This adapter remains unavailable to the UI and registry pending review and
  provider verification. It is not a claim of production support.
