# NBA scoreboard adapter foundation (provider-limited)

This is a **read-only, experimental foundation only**. The historical NBA.com
candidate remains provider-limited, while the separate ESPN current-scoreboard
adapter is the current experimental implementation. Neither path is wired into
the UI or presented as a live playable sport. No path falls back to MLB/mock data,
and fixture data is never presented as live.

## Candidate provider endpoint

- Exact public NBA.com candidate: `GET https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`
- This is a current/today scoreboard resource; it does not provide a verified
  date query contract. The date-specific `stats.nba.com` scoreboard route was
  not selected as the adapter endpoint because access could not be verified.
- The fixture types model the observed/commonly published live-scoreboard shape
  (`scoreboard.games`, home/away team summaries, status, UTC start time), but
  the payload schema remains provider-unverified for this repository.

## Verification result (September 8, 2026, this environment)

The endpoint was probed once with a read-only `GET`, a 15-second timeout,
`User-Agent: Mozilla/5.0`, and `Accept: application/json`:

- CDN scoreboard: **HTTP 403 Forbidden**.
- No response JSON was available to validate the payload or date behavior.
- A separate `stats.nba.com/stats/scoreboardv3?GameDate=09%2F08%2F2026&LeagueID=00`
  probe timed out. It is not used by the implementation.

Therefore the NBA.com candidate is **provider-limited**, not supported. The 403 does
not prove that the endpoint always requires authentication or a particular
header set; it only records the observed result from this network/client.

## Headers, authentication, and limits

- Headers required by NBA.com: **not verified**. The only headers used in the
  probe were the browser-like `User-Agent` and `Accept: application/json`; they
  did not establish access.
- No-auth status: **not verified**. No API key, cookie, token, or credential was
  supplied, but the 403 means anonymous access cannot be claimed.
- Rate limits and availability guarantees: **not documented or verified** for
  this endpoint. Do not add retries, polling, or production registration until
  an approved environment verifies access, response schema, date semantics,
  and provider terms/rate behavior.
- The implementation intentionally has no HTTP client, timeout, or network/JSON
  error path because exposing an unverified request path would imply support.
  Those behaviors must be added only after the endpoint contract is verified.

## Local guarantees

- `validateNbaDate` accepts only real `YYYY-MM-DD` calendar dates.
- `normalizeNbaGame` and `normalizeNbaScoreboard` are pure and return shared
  `NormalizedGame`/`NormalizedTeam` contracts.
- `runNbaNormalizationChecks` is deterministic and makes no network request.
- The registry exposes NBA as `experimental` with all UI capabilities disabled.
- The ESPN adapter exposes only a current-scoreboard foundation; date queries are
  strictly validated and then rejected because date behavior is unverified.
- NBA remains status-only in the panel and is not a live playable sport.
