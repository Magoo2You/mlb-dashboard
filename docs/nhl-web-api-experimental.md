# NHL Web API adapter (experimental)

This repository contains a **read-only, experimental adapter foundation** for the
NHL Web API. It is not registered in the sport registry and is unavailable in the
UI until an explicit UI integration and verification pass is completed. It never
falls back to MLB data or mock content.

## Provider surface

- Base URL: `https://api-web.nhle.com/v1`
- Date-based schedule: `GET https://api-web.nhle.com/v1/schedule/{YYYY-MM-DD}`
- Current standings: `GET https://api-web.nhle.com/v1/standings/now`

On September 8, 2026, both endpoints returned HTTP 200 from this environment
without an API key or account when requested with a normal browser user-agent.
A request made without that user-agent received HTTP 403, so “no auth” does not
mean every network path is accepted. The adapter sends no credentials and treats
provider errors as errors.

## Boundaries and limitations

- The endpoint is an NHL-operated public web service, but it is undocumented and
  unsupported as a third-party developer API; its schema, availability, and rate
  limits may change without notice.
- The adapter validates real `YYYY-MM-DD` calendar dates, applies a 10-second
  abort timeout, reports non-2xx/invalid JSON/network failures, and normalizes
  only schedule games and standings fields that map to the shared sport contracts.
- Malformed provider records are omitted rather than synthesized. No caching,
  retries, authentication, persistence, live-score polling, or UI wiring is
  included.
- NHL-specific standings semantics do not map perfectly to the generic contract;
  overtime losses are represented in the shared `ties` field as the closest
  available field and should not be presented as baseball-style ties.

Deterministic normalization checks live in
`src/sports/nhl/nhl-normalization-checks.ts`. The build does not call the
provider.
