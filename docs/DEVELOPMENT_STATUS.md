# Development Status

_Last updated: 2026-09-09_

This document records verified work on the `ChatGPT2026Version` branch. It is a living record, not a replacement for the README or the clean-room build guide.

## Branch and release boundary

- Working branch: `ChatGPT2026Version`
- Protected baseline: `main` remains unchanged
- Latest verified checkpoint: experimental NFL current-scoreboard preview (this branch)
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
| Visual/performance pass | Remote wallboard/news/player images in the active passive views now reserve their rendered dimensions, decode asynchronously, and lazy-load below the header; the permanent marquee compositor hint was removed to avoid an always-promoted layer. |
| Multi-sport foundation | Shared contracts and experimental NHL, NFL, and NBA provider adapters exist without false live claims. |
| Automated checks | `npm test` runs deterministic NHL/NFL/NBA/ESPN-NBA normalization checks, browserless navigation/API contract checks, and MLB schedule/live-feed transformer fixture checks. |
| MLB transformer coverage | Captured-shape fixtures cover schedule score fallback from `linescore.teams`, scoring-play text/inning mapping, live status and linescore mappings, reverse chronological plays, scoring-play filtering, RBI, and per-play `about.awayScore`/`about.homeScore`. |
| Statcast leaderboard integrity | Season-scoped hitting, pitching, and fielding requests use explicit `statGroup` values and `statType=season`. Captured fixtures reject cross-scope duplicates, preserve verified provider categories, map WHIP from `walksAndHitsPerInningPitched`, and map fielding `putOuts` without confusing catcher stolen-bases-allowed with hitting stolen bases. |
| Trivia/lore provenance | Active lore inventory: 55 retained entries; 0 verified, 55 reviewed-unverified, 55 unique IDs, 0 missing/invalid HTTPS URLs. All entries carry explicit status/provenance and the wallboard labels them `REVIEWED · UNVERIFIED`; claim-level verification is pending. |
| Responsive layout | Interactive mode scrolls and adapts to narrow screens; wallboard clipping behavior is preserved. |
| Interactive scroll ownership | The reported Schedule/Standings wheel-scroll symptom was traced to nested vertical overflow shells. Schedule, Standings, Statcast, Who's Hot, and Sports now leave vertical scrolling to the document; `.responsive-table-wrap` retains horizontal scrolling and wallboard clipping remains intentional. |
| Scroll contract | Browserless source checks assert active interactive shells do not use nested vertical overflow, while responsive table wrappers retain `overflow-x: auto`. |
| Game detail | Schedule selections can open validated MLB live-feed details with loading, retry, empty, and return states. |
| Request coalescing | Client JSON requests coalesce identical concurrent endpoints and preserve errors; server MLB upstream fetches coalesce identical in-flight URLs and always discard failed promises. |
| Polling/cache alignment | Passive Who's Hot refresh runs at the verified ten-minute server TTL; ticker polling is 30 seconds in both Header and passive mode, matching its server cache TTL. |
| Who's Hot refresh lock | Concurrent cache misses for the same validated query share one bounded-cache refresh; the existing 32-key/ten-minute freshness and eviction behavior remain unchanged. |
| Render recovery | The application is wrapped in an accessible error boundary that catches render and lazy-load failures, exposes only a generic recovery message, and offers a reload-based “Try again” action. The wallboard remains the default when no error occurs. |

## Who's Hot commentary contract

The active `/api/whos-hot` route keeps the existing aggregate/surge response arrays and legacy fields (`hotReason`, `hotStreak`, and `breakoutNotes`) for compatibility; it also exposes the analysis fields `primaryReason` and `statHighlights`. Commentary is now generated by pure deterministic helpers in `src/sports/mlb/whos-hot-analysis.ts` from the recent game-log aggregates and optional season `stat` fields:

- Hitters: game count/date span, AB, H, HR, RBI, BB, HBP, SF, total bases, stolen bases; optional season OPS/AVG/SLG/OBP and season BB/PA baselines. The WHY text selects a supported OPS surge, contact, slugging, plate-discipline, sustained-production, or current-window explanation. `breakoutNotes` contains the separate counted-stat evidence line rather than a copy of WHY.
- Pitchers: game count/date span, IP, ER, SO, BB, H; optional season ERA/WHIP baselines. The WHY text only discusses ERA/WHIP/run prevention and the evidence line contains the counted pitching totals. It never describes hitter metrics.
- Missing baselines are represented as unavailable fields; the route no longer substitutes `.750` OPS, `.250` AVG, `3.50` ERA, or `1.20` WHIP. Small samples return an explicit insufficient-data explanation in the helper contract, while the route's existing minimum AB/IP filters continue to omit unusable cards.
- Date spans are explicit (`startDate`/`endDate` when requested, otherwise the actual recent-log endpoints) and sample sizes are included in WHY text. These are descriptive associations from provider aggregates, not causal claims or Statcast explanations.

Fixture checks live in `scripts/run-whos-hot-analysis-checks.ts` and run under `npm test`; they do not contact MLB or add network-dependent tests.


- **MLB StatsAPI/RSS:** active production path; real schedule and game-feed data were smoke-tested.
- **MLB StatsAPI leaders:** read-only probes confirmed separate `statGroup=hitting` and `statGroup=pitching` requests return the expected five categories per group for season 2026. Returned lists are ordered by provider (descending for counting/rate leader highs such as HR/OPS/K and ascending for ERA/WHIP); qualification metadata is not present in the response, so no local qualification claim is made.
- **NHL Web API:** experimental same-origin schedule preview; browser user-agent access worked, plain requests returned `403`; standings and play-by-play remain unavailable.
- **NFL ESPN scoreboard:** experimental same-origin current-scoreboard preview; public endpoint returned HTTP 200 during verification and normalized route checks pass. Undocumented schema/rate limits remain; standings, rosters, drives, and play-by-play are not exposed.
- **NBA ESPN scoreboard:** experimental same-origin current-scoreboard preview; the provider returned HTTP 200 during verification, and route/normalization/browserless checks pass. Date navigation, standings, leaders, and play-by-play are not exposed; undocumented schema/rate limits remain.
- **NBA.com endpoints:** documented as blocked/unstable in the experimental provider notes.
- **Gemini:** removed because it was not actively used. No replacement AI provider is assumed.

## Known limitations

- Identical concurrent requests are coalesced only while in flight; the client does not add a response cache, so freshness semantics and explicit retry/error behavior are unchanged.
- Server upstream coalescing is process-local and does not coordinate across multiple server processes/instances. Who's Hot cache remains process-local, bounded to 32 keys, and expires after ten minutes.
- The fixture suite does not verify provider availability or semantics for optional `scoringPlays` hydration, `liveData.plays.currentPlay`, pitch/hit `pitchData`, box-score player maps, or decision fields. These remain provider-integration concerns and require separately captured responses.
- No full browser/device visual test runner is installed; responsive layout, focus behavior, lazy image timing/fallback paint, lazy view mounting, and rendered error/empty states still require a real browser or desktop preview. Browserless smoke checks cover pure navigation state and mocked fetch contracts only.
- The local preview can verify reachable page scroll behavior, but wheel-event interaction is not fully proven by the browserless suite; modal internals and game-detail play lists intentionally retain bounded vertical scrolling.
- The error-boundary fallback contract is checked deterministically without a DOM; full DOM interaction, including activating the recovery button and observing a browser reload, remains browser-tested.
- Dense standings and box-score tables remain horizontally scrollable on narrow screens.
- MLB transformer coverage now includes deterministic schedule/live-feed fixtures; live provider variation beyond the covered fields remains unverified.
- Statcast leader qualification thresholds are provider-controlled and not exposed in the captured leader-group payloads; the route does not guess or synthesize them. Additional qualification-dependent pitching categories remain deferred. Fielding is limited to provider-returned season `fieldingPercentage`, `putOuts`, `assists`, and `errors`; the UI preserves provider ordering and does not claim a local qualification threshold.
- Experimental sports remain clearly labeled and limited to verified read-only preview contracts; NFL exposes current scoreboard only.
- The production build is code-split, but the main application chunk remains substantial and should be monitored. The verified post-pass build emitted `dist/assets/index-ChRJfwRR.js` at 447.13 kB (129.99 kB gzip) and `dist/assets/index-CV3ihz9j.css` at 84.52 kB (12.93 kB gzip); no new dependency or bundle-splitting change was justified by this focused pass.
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
