# Experimental ESPN NBA scoreboard adapter

The adapter is now exposed only through the same-origin `/api/sports/nba/scoreboard` route and the Sports status panel. It remains read-only and experimental: the UI renders only a response that passes the normalized route contract, with loading, unavailable, and no-games states. It does not run during the build, does not call ESPN at build time, and has no mock, synthetic, or fixture fallback when the provider request fails.

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

## Same-origin route contract

- `GET /api/sports/nba/scoreboard` accepts no query parameters. Any `date` or other query parameter is rejected with HTTP 400; date navigation is not exposed.
- The server uses the adapter's bounded 10-second abort timeout and returns only generic HTTP 503 errors to clients. Provider error details are logged server-side only.
- A 200 response is returned only when every normalized game has two valid NBA competitors, a parseable scheduled time, a supported state, and valid non-negative scores. Invalid upstream data returns HTTP 503; there is no fallback data.
- The browser calls only this same-origin route and repeats the normalized response validation before rendering.

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
