# Experimental ESPN NBA scoreboard adapter

This adapter is a separate, read-only experimental provider. It is **not wired
into the UI or the shared sport registry**. It does not run during the build,
does not call ESPN at build time, and has no mock, synthetic, or fixture fallback
when the provider request fails.

## Endpoint and probe

- Exact endpoint: `GET https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`
- A direct read-only probe in this environment returned **HTTP 200** with JSON.
- The probe required no API key, token, cookie, or other credential. This records
  the observed no-auth behavior only; it is not a guarantee of future access.
- The adapter uses a 10-second abort timeout and sends `Accept: application/json`.

## Date behavior

The HTTP 200 probe verified the current scoreboard endpoint only. Date-query
behavior was not verified, so this adapter intentionally supports the current
scoreboard only. A supplied date is still strictly validated as a real
`YYYY-MM-DD` calendar date, then rejected with an explicit unsupported-date
error; it is never silently converted into a current-scoreboard request.

## Normalization and errors

The adapter maps ESPN events and home/away competitors into the shared
`NormalizedGame` and `NormalizedTeam` contracts. Pure deterministic checks use
a representative ESPN fixture shape and cover valid/invalid dates, final-state
mapping, scores, and incomplete-event rejection. Those checks never contact
ESPN and are not used as runtime data.

HTTP errors, invalid JSON, invalid JSON object shape, abort timeouts, and network
errors are surfaced as `EspnNbaApiError` with the endpoint and (when available)
HTTP status. No retry or fallback behavior is included.

## Limitations and status

ESPN does not publish a stable contract for this endpoint in the repository
context. Rate limits, quota behavior, retention/history guarantees, schema
stability, terms, and availability are undocumented or unverified here. The
observed HTTP 200/no-auth result is therefore evidence for an experimental
candidate, not a production support claim. The adapter remains deliberately
outside the UI and registry until those concerns and date semantics are verified.
