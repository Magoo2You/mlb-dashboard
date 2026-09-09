# Development Status

_Last updated: 2026-09-09_

This document records verified work on the `ChatGPT2026Version` branch. It is a living record, not a replacement for the README or the clean-room build guide.

## Branch and release boundary

- Working branch: `ChatGPT2026Version`
- Protected baseline: `main` remains unchanged
- Latest verified checkpoint: MLB transformer fixture coverage (this branch)
- Changes are committed and pushed only after tests, lint, build, and relevant smoke checks pass.
- Scratch probes, credentials, caches, generated media, and temporary runtime files remain outside production commits.

## Verified implementation checkpoints

| Checkpoint | Result |
|---|---|
| Lint scope | TypeScript checks target application entrypoints; `npm run lint` passes. |
| Motion controls | Passive wallboard has visible pause/play control and reduced-motion support. |
| Security | API inputs are validated, client errors are generic, cache behavior is bounded, and Gemini integration is removed. |
| Dependencies | Express upgraded to 5.2.1; `npm audit --omit=dev --audit-level=moderate` reports zero vulnerabilities. |
| Data trust | Failed/empty MLB requests no longer silently become live-looking mock games; panel error, retry, and off-day states exist. |
| Navigation | Wallboard remains the default; interactive Schedule, Standings, Statcast, Who's Hot, Sports, and Game Feed paths are reachable. |
| Accessibility | Reachable controls have keyboard semantics, labels, focus styling, modal focus management, and non-nested schedule interactions. |
| Performance | Interactive views are code-split; initial JavaScript is below the prior 500 kB warning threshold. |
| Multi-sport foundation | Shared contracts and experimental NHL, NFL, and NBA provider adapters exist without false live claims. |
| Automated checks | `npm test` runs deterministic NHL/NFL/NBA/ESPN-NBA normalization checks, browserless navigation/API contract checks, and MLB schedule/live-feed transformer fixture checks. |
| MLB transformer coverage | Captured-shape fixtures cover schedule score fallback from `linescore.teams`, scoring-play text/inning mapping, live status and linescore mappings, reverse chronological plays, scoring-play filtering, RBI, and per-play `about.awayScore`/`about.homeScore`. |
| Responsive layout | Interactive mode scrolls and adapts to narrow screens; wallboard clipping behavior is preserved. |
| Game detail | Schedule selections can open validated MLB live-feed details with loading, retry, empty, and return states. |
| Request coalescing | Client JSON requests coalesce identical concurrent endpoints and preserve errors; server MLB upstream fetches coalesce identical in-flight URLs and always discard failed promises. |
| Polling/cache alignment | Passive Who's Hot refresh runs at the verified ten-minute server TTL; ticker polling is 30 seconds in both Header and passive mode, matching its server cache TTL. |
| Who's Hot refresh lock | Concurrent cache misses for the same validated query share one bounded-cache refresh; the existing 32-key/ten-minute freshness and eviction behavior remain unchanged. |

## Provider status

- **MLB StatsAPI/RSS:** active production path; real schedule and game-feed data were smoke-tested.
- **NHL Web API:** experimental adapter; browser user-agent access worked, plain requests returned `403`; not UI-wired.
- **NFL ESPN scoreboard:** experimental adapter; public endpoint worked during verification; undocumented schema/rate limits; not UI-wired.
- **NBA ESPN scoreboard:** experimental adapter; current scoreboard worked during verification; date queries are unverified; not UI-wired.
- **NBA.com endpoints:** documented as blocked/unstable in the experimental provider notes.
- **Gemini:** removed because it was not actively used. No replacement AI provider is assumed.

## Known limitations

- Identical concurrent requests are coalesced only while in flight; the client does not add a response cache, so freshness semantics and explicit retry/error behavior are unchanged.
- Server upstream coalescing is process-local and does not coordinate across multiple server processes/instances. Who's Hot cache remains process-local, bounded to 32 keys, and expires after ten minutes.
- The fixture suite does not verify provider availability or semantics for optional `scoringPlays` hydration, `liveData.plays.currentPlay`, pitch/hit `pitchData`, box-score player maps, or decision fields. These remain provider-integration concerns and require separately captured responses.
- No full browser/device visual test runner is installed; responsive layout, focus behavior, lazy view mounting, and rendered error/empty states still require a real browser or desktop preview. Browserless smoke checks cover pure navigation state and mocked fetch contracts only.
- Dense standings and box-score tables remain horizontally scrollable on narrow screens.
- MLB transformer coverage now includes deterministic schedule/live-feed fixtures; live provider variation beyond the covered fields remains unverified.
- Experimental sports adapters are not yet exposed as live dashboards.
- The production build is code-split, but the main application chunk remains substantial and should be monitored.
- Legacy copies and explicit demo fixtures remain for rollback/experimental purposes and must not be mistaken for the active production path.

## Active queue themes

1. Browserless and MLB transformer regression coverage.
2. API contract, request-race, polling, cache, RSS, lifecycle, logging, and security-header hardening.
3. Honest experimental NHL/NFL/NBA preview integration through safe server boundaries.
4. Legacy-path cleanup and full consistency/style review.
5. Innovation prototypes, followed by explicit evaluation and integration only for verified winners.
6. Final clean-room `BUILD_FROM_SCRATCH.md`, release review, and handoff report.

## Operating rules

- Find root cause before fixing behavior.
- Do not present synthetic, stale, or provider-blocked values as live data.
- Keep sport-specific behavior behind adapters and capabilities.
- Keep wallboard and interactive layout requirements separate.
- Treat transport success as insufficient; verify response shape and user-visible behavior.
- Every committed change must leave the branch buildable, testable, and synchronized with GitHub.
