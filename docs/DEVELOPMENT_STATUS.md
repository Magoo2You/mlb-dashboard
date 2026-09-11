# Development Status

_Last updated: 2026-09-10_

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
| Trivia/lore provenance | Active lore inventory: 79 retained entries; 24 verified, 55 reviewed-unverified, 79 unique IDs, 0 missing/invalid HTTPS URLs. Verified IDs are listed below; retained legacy claims remain explicitly unverified, including the contradicted Pedro Martínez item. The latest production batch adds four source-reviewed records spanning Negro League history, MLB policy, a pitching milestone, a single-game batting record, and an innings-defined game record. |
| Trivia/lore rotation | Passive wallboard rotation filters to the 24 verified base lore entries plus verified historical biographies (28 current runtime learning items), uses a deterministic seeded shuffle, covers the full available pool before reshuffling, prevents the prior pool's final item from opening the next pool, and renders no lore cards when the verified pool is empty. |
| Historical player profiles | Four-profile source-aware pilot remains stored at `src/data/historical-player-profiles.ts`; only profiles marked verified and carrying biography evidence enter the verified Trivia/Lore rotation, and each learning card uses the selected biography evidence's source/provenance. Richer profile records and unresolved conflicts remain separate internally. Media remains rights-unresolved/permission-required leads rather than local assets. |
| Visual QA baseline | Fresh baseline recorded at `docs/VISUAL-QA-BASELINE-2026-09-10.md` against commit `1093e50973dde37ec2fe9cd80ed2414f00f365f4`, fresh port 4330, and intended 1920×1080 desktop scope. The embedded preview-width artifact and standalone Chrome compositor limitation are separated from confirmed app backlog findings; no styling changes were made in the baseline checkpoint. |
| Visual geometry pass | Shared dashboard tokens now define surface/border/text/accent/focus/radius values. Interactive standings tables reserve a 15rem team column and stable numeric columns while retaining narrow horizontal access. Game Feed panels explicitly opt out of stretch-driven minimum height and use compact shell spacing. Full verification passed after the change; wallboard clipping was not altered. |
| Data context pass | Added reusable `DataContext` presentation to Statcast and Who's Hot. Panels now show provider, season/window scope, and the freshness event without inventing retrieval timestamps or changing provider data. |
| Who's Hot live review | Bounded fresh-server review recorded at `docs/WHOS-HOT-LIVE-REVIEW-2026-09-10.md`: 14-day, 60-day, and custom-date requests returned valid JSON with six records per bucket; invalid timeframe and reversed dates returned JSON 400 responses. The automatic wallboard and manual default now use a 7-day window; custom date ranges remain manual-only. No production code change was required by the live review. |
| Lore image pilot | Two verified local assets are active: Cy Young (`public/assets/lore/cy-young-commons-18463908.jpg`, Commons page ID 18463908, LOC `ppmsca.18460`) and Walter Johnson (`public/assets/lore/walter-johnson-commons-67430005.jpg`, Commons page ID 67430005, LOC LCCN `2016873232` / `hec.24261`). Both are recorded as public domain/no-known-restrictions candidates with creator, collection, source record, rights advisory, attribution, and retrieval date metadata. |

### Verified lore IDs and sources (evidence checked 2026-09-10)

- `record-ichiro-262` — https://www.mlb.com/news/ichiro-s-season-hit-record-may-be-unbreakable-c275212644
- `record-nolan-ryan-7-nohitters` — https://baseballhall.org/discover/inside-pitch/ryan-throws-seventh-no-hitter
- `record-ripken-2632` — https://baseballhall.org/discover/inside-pitch/cal-ripken-breaks-lou-gehrigs-consecutive-games-record
- `record-cy-young-511` — https://baseballhall.org/hall-of-famers/young-cy
- `record-rickey-1406` — https://www.mlb.com/news/10-incredible-rickey-henderson-stats
- `record-hank-aaron-755` — https://baseballhall.org/hall-of-famers/aaron-hank
- `record-don-larsen-perfect-world-series` — https://www.mlb.com/video/56-ws-larsen-s-perfect-game-c3192326
- `record-vander-meer-back-to-back-nohitters` — https://www.mlb.com/news/johnny-vander-meer-threw-consecutive-no-hitters
- `record-gehrig-2130` — https://baseballhall.org/hall-of-famers/gehrig-lou
- `record-walter-johnson-417` — https://baseballhall.org/hall-of-famers/johnson-walter
- `record-tris-speaker-450-assists` — https://baseballhall.org/hall-of-famers/speaker-tris
- `record-maddux-355-wins` — https://baseballhall.org/hall-of-famers/maddux-greg
- `record-dimaggio-56-game-streak` — https://www.mlb.com/news/joe-dimaggio-56-game-hitting-streak
- `game-mlb-1919-51-minute-nine-innings` — https://www.mlb.com/news/longest-games-in-baseball-history-c275773542
- `game-al-1984-baines-25-inning-walkoff` — https://baseballhall.org/discover/inside-pitch/baines-blast-ends-longest-game-in-AL-history
- `postseason-2022-world-series-combined-nohitter` — https://www.mlb.com/news/astros-no-hit-phillies-in-world-series-game-4
- `all-star-2023-same-surname-homers` — https://www.mlb.com/news/2023-all-star-game-facts-and-figures
- `record-ohtani-first-50-50-season` — https://www.mlb.com/news/shohei-ohtani-reaches-50-homers-50-steals
- `record-ohtani-first-3hr-2sb-game` — https://www.mlb.com/news/shohei-ohtani-reaches-50-homers-50-steals
- `record-ohtani-fastest-40-40-126-games` — https://www.mlb.com/news/shohei-ohtani-reaches-50-homers-50-steals
- `NGR-2020-MLB-RECOGNITION` — https://www.mlb.com/history/negro-leagues/history
- `record-clemens-first-20-strikeouts-nine-inning-game` — https://www.mlb.com/news/pitchers-who-recorded-20-strikeouts-in-a-game
- `gehrig-1932-16-total-bases` — https://baseballhall.org/discover-more/stories/inside-pitch/lou-gehrig-hits-four-consecutive-home-runs
- `game-mlb-1920-26-innings` — https://sabr.org/gamesproj/game/may-1-1920-an-extreme-exercise-in-futility-braves-dodgers-play-26-innings-to-no-decision

Sources were used for factual verification and file-level rights review. The repository copies only the two documented public-domain Commons derivatives; no MLB or Hall CDN image is used. Exact source records, rights text, and limitations are maintained in `LORE-IMAGE-RIGHTS-RESEARCH.md`; all other historical-player images remain deferred.

| Responsive layout | Interactive mode scrolls and adapts to narrow screens; wallboard clipping behavior is preserved. |
| Interactive scroll ownership | The reported Schedule/Standings wheel-scroll symptom was traced to nested vertical overflow shells. Schedule, Standings, Statcast, Who's Hot, and Sports now leave vertical scrolling to the document; `.responsive-table-wrap` retains horizontal scrolling and wallboard clipping remains intentional. |
| Scroll contract | Browserless source checks assert active interactive shells do not use nested vertical overflow, while responsive table wrappers retain `overflow-x: auto`. |
| Schedule date semantics | Schedule dates use the local calendar date rather than UTC. The passive wallboard preserves the prior day's final scores until today's first game starts, then advances to the next available slate after today's games are complete. |
| Visual layout refinement | Standings rows preserve native table-cell geometry with non-wrapping numeric cells; the Game Feed Statcast panel is content-sized at desktop widths; its play filters remain horizontally usable and keyboard-consistent on narrow screens. |
| Wild Card standings | MLB's `standingsTypes=wildCard` response is now requested separately and mapped from the provider's `wildCardGamesBack` field. Both interactive and passive standings views render provider-ranked Wild Card records; passive wallboard no longer uses an empty/mock Wild Card array. Fresh port 4325 returned two league payloads with ranked teams and games-back values. |
| Wallboard header geometry | At the 1920x1080 desktop baseline, the wallboard header reserves a dedicated upper band and keeps its slide selector, pause control, and clock in a non-overlapping lower control row. Fresh Chrome capture against port 4326 verified the geometry before navigation consolidation. |
| Wallboard view navigation | The global Views overlay was removed from the wallboard and consolidated into its header alongside Scoreboard & Game Feed and Division Standings. Schedule, Statcast, Who's Hot, and Sports are selectable destinations; only the first two remain in automatic rotation, and Sports is never auto-rotated. |
| Wallboard control styling | Wallboard rotation and selectable-view controls now share consistent sans-serif typography, spacing, rounded treatment, non-wrapping labels, and Lucide icons. The header uses a compact 1920x1080 layout and keeps the larger available canvas for content. |
| Wallboard logo asset | The wallboard now uses a locally served SVG MLB mark at `public/assets/mlb-logo.svg`, replacing the low-resolution RGB PNG path. The asset was fetched from the Wikimedia Commons MLB logo record and serves successfully from the fresh app preview. |
| Game detail | Schedule selections can open validated MLB live-feed details with loading, retry, empty, and return states. |
| Request coalescing | Client JSON requests coalesce identical concurrent endpoints and preserve errors; server MLB upstream fetches coalesce identical in-flight URLs and always discard failed promises. |
| Polling/cache alignment | Passive Who's Hot refresh runs at the verified ten-minute server TTL; ticker polling is 30 seconds in both Header and passive mode, matching its server cache TTL. |
| Who's Hot refresh lock | Concurrent cache misses for the same validated query share one bounded-cache refresh; the existing 32-key/ten-minute freshness and eviction behavior remain unchanged. |
| Render recovery | The application is wrapped in an accessible error boundary that catches render and lazy-load failures, exposes only a generic recovery message, and offers a reload-based “Try again” action. The wallboard remains the default when no error occurs. |

## Who's Hot commentary contract

The active `/api/whos-hot` route keeps the existing aggregate/surge response arrays and legacy fields (`hotReason`, `hotStreak`, and `breakoutNotes`) for compatibility; it also exposes the analysis fields `primaryReason` and `statHighlights`. Commentary is now generated by pure deterministic helpers in `src/sports/mlb/whos-hot-analysis.ts` from the recent game-log aggregates and optional season `stat` fields:

- Hitters: game count/date span, AB, H, HR, RBI, R, BB, HBP, SF, total bases, stolen bases, strikeouts; optional season OPS/AVG/SLG/OBP and season BB/PA baselines. HR/RBI/R/SB/TB trend commentary requires a season count and games-played denominator and compares per-game production; OPS/AVG/SLG/BB rate use their available rate denominator. The WHY text selects a supported metric-specific Recent improvement, Sustained performance, Current-window production, or No supported baseline change explanation. `breakoutNotes` contains separate counted-stat evidence.
- Pitchers: game count/date span, IP, ER, SO, BB, H, HR; optional season ERA/WHIP and season SO/BB/H/HR with innings baselines. K/9, BB/9, H/9, and HR/9 are not described as changes without both recent and season IP denominators. The WHY text can identify ERA, WHIP, K/9, BB/9, H/9, HR/9, or workload context and the evidence line contains the counted pitching totals. It never invents a baseline or describes hitter metrics.
- Missing baselines are represented as unavailable fields; the route no longer substitutes `.750` OPS, `.250` AVG, `3.50` ERA, or `1.20` WHIP. Small samples return an explicit insufficient-data explanation in the helper contract, while the route's existing minimum AB/IP filters continue to omit unusable cards.
- Date spans are explicit (`startDate`/`endDate` when requested, otherwise the actual recent-log endpoints) and sample sizes are included in WHY text. These are descriptive associations from provider aggregates, not causal claims or Statcast explanations.

Fixture checks live in `scripts/run-whos-hot-analysis-checks.ts` and run under `npm test`; they do not contact MLB or add network-dependent tests. A read-only StatsAPI inspection confirmed hitter game logs expose `runs`, `homeRuns`, `rbi`, `stolenBases`, `totalBases`, `strikeOuts`, and pitcher season/game logs expose `homeRuns`, `hits`, `strikeOuts`, `baseOnBalls`, `inningsPitched`, `era`, `whip`, and provider rate fields. The active trend code still calculates rates only from explicit count/IP or AB/PA denominators. Exit velocity is limited to live-feed `hitData.launchSpeed` when present; Who's Hot does not use it and GameView shows `Unavailable` without it.


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
- Statcast leader qualification thresholds are provider-controlled and not exposed in the captured leader-group payloads; the route does not guess or synthesize them. Additional qualification-dependent pitching categories remain deferred. Fielding now requests provider-returned season `putOuts`, `assists`, `doublePlays`, `triplePlays`, and `rangeFactorPerGame`. These are labeled as opportunity- and position-sensitive activity/context measures; Errors and unqualified `fieldingPercentage` are intentionally excluded from the active leaderboard UI.
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
