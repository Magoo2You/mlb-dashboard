<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c2a823e5-77fb-474b-ae2b-e055e5465f10

## Dashboard modes

The passive wallboard remains the default view. The fixed **Views** tablist provides keyboard-accessible access to Schedule, Standings, Statcast, and Who's Hot; use Left/Right (or Up/Down), Home, and End to move between tabs. Every interactive view includes a **Return to wallboard** control.

The Schedule view reuses the existing date navigator and schedule cards and opens player profiles when the feed contains valid decision-player IDs. Select a game and use its **Open game feed** action to load the detailed `GameView`; it provides loading, retryable error, empty play-by-play, and return-to-schedule states. The view is mounted only after the API response satisfies the typed detail-feed contract, and no mock fallback is presented as live data.

The Statcast view uses season-scoped MLB StatsAPI leaderboards with separate `statGroup=hitting`, `statGroup=pitching`, and `statGroup=fielding` requests, each with explicit `statType=season`. Accessible Hitting, Pitching, and Fielding tabs keep categories in their verified provider scopes. Hitting cards are home runs, OPS, batting average, RBI, and stolen bases; Pitching cards are ERA, strikeouts, WHIP, wins, and saves. Fielding cards are putouts, assists, double plays, triple plays, and range factor per game; these are opportunity- and position-sensitive activity/context measures, not universal defensive-quality rankings. WHIP is mapped from the provider's `walksAndHitsPerInningPitched` category. Errors and unqualified fielding percentage are intentionally not presented as fielding leaderboards. Provider ordering is preserved: descending for counting/high-rate leaderboards and ascending for ERA/WHIP. The provider payload does not expose qualification metadata, so the dashboard makes no qualification claim, invents no values, and defers additional qualification-dependent categories.

Interactive views use a separate responsive shell: narrow screens and browser zoom can scroll vertically without changing the passive wallboard's fixed broadcast canvas. Schedule cards collapse to one column on small widths; standings, inning linescores, and box-score tables retain readable columns in horizontal scrollers with a visible narrow-screen scroll hint. Very wide tables remain horizontally scrollable on desktop; their dense column sets are not converted to card layouts.

## Who's Hot data contract

The Who's Hot view reads the live `/api/whos-hot` route only. Its **WHY** explanation is deterministic and provider-backed: hitter cards use recent game-log AB/H/HR/RBI/R/BB/HBP/SF/total bases/SB/strikeouts, with OPS/AVG/SLG/OBP and BB/PA plus count baselines only when the season provider fields and denominators exist. Hitter count trends are compared per game; rate context uses the available AB or PA denominator. Pitcher cards use IP/ER/SO/BB/H/HR plus ERA/WHIP and K/9, BB/9, H/9, HR/9 baselines only when season innings and the corresponding season counts exist. Each explanation includes its game/IP sample and date span. Raw totals without a baseline denominator are evidence only, not a claimed improvement. Missing baselines are shown as unavailable rather than filled with defaults, and the commentary describes observed statistical associations—not causes or unsupported Statcast metrics. `primaryReason`/`hotReason` carry WHY and `statHighlights`/`breakoutNotes` carry separate evidence.


The discoverable **Sports** view is a status-only selector built from `src/domain/sport-registry.ts`. MLB remains the only supported live sport and selecting MLB returns to the default wallboard. NFL is labeled **Experimental preview** and shows only validated current scoreboard data through a same-origin route, with loading/error/empty states; standings, rosters, drives, and play-by-play are not exposed. NHL remains an experimental schedule preview. NBA is labeled **Experimental · provider-limited** and shows only validated current ESPN scoreboard data through a same-origin route, with loading/error/empty states; date navigation, standings, leaders, and play-by-play are not exposed. The panel uses native buttons, visible focus rings, arrow/Home/End navigation in the surrounding tablist, and explanatory status text so incomplete coverage is never presented as supported live data.

## Trivia/lore data trust

The active wallboard imports only `src/data/baseball-lore-expanded.ts`. The current inventory contains **79 retained entries**, **24 verified**, **55 reviewed-unverified**, **79 unique IDs**, and **0 missing or syntactically invalid source URLs**. The source URLs are preserved rollback/provenance pointers, while verified entries also carry claim-level provenance. Every active entry carries `verificationStatus` and `provenance`; unverified legacy entries remain explicitly labeled rather than being presented as verified.

The local-image pilot adds only two file-level-cleared historical portraits. `record-cy-young-511` uses `public/assets/lore/cy-young-commons-18463908.jpg`, Wikimedia Commons `File:Cy Young.jpg` (Commons page ID 18463908; LOC digital ID `ppmsca.18460`), identified as public domain and credited to Bain News Service/LOC. `record-walter-johnson-417` uses `public/assets/lore/walter-johnson-commons-67430005.jpg`, Wikimedia Commons `File:Walter Johnson LCCN2016873232.jpg` (Commons page ID 67430005; LOC LCCN `2016873232` / digital ID `hec.24261`), identified as public domain with the LOC advisory “No known restrictions on publication.” Metadata in each item preserves creator, collection, exact source record, rights advisory, attribution, and retrieval date. The cards render local paths only, with an accessible portrait alt text and a baseball fallback if loading fails; no external image URL is displayed. See [`LORE-IMAGE-RIGHTS-RESEARCH.md`](LORE-IMAGE-RIGHTS-RESEARCH.md) for limitations and deferred candidates.

The Pedro Martínez perfect-game claim is unresolved/contradicted by authoritative references: the Hall of Fame records his June 3, 1995 perfect-game bid into the 10th inning and his Sept. 10, 1999 17-strikeout Yankees game, not a June 1, 2000 Yankees perfect game. It remains unchanged for rollback and is not presented as verified. Other retained entries include unsupported or internally inconsistent claims (for example invented-looking player records, generic source pages, and incorrect dates/teams); they are not silently corrected. `scripts/run-lore-validation-checks.ts` runs under `npm test` and enforces required strings, unique IDs, required HTTPS source URLs, parseable URLs, verified-entry provenance, and rotation coverage.

`baseball-lore-items.ts`, `baseball-lore-complete.ts`, `baseball-lore-collection.ts`, and `src/utils/lore-*` are legacy/experimental providers or datasets and are not active wallboard imports. They remain in place for rollback and must not be treated as verified production lore.

### Source policy for future reviews

Review claims individually; do not bulk-import trivia. Prefer, in order, primary/official MLB records and history, the National Baseball Hall of Fame, Library of Congress digitized historical guides, Retrosheet game records, SABR research/trivia with answer keys, and Baseball-Reference as a secondary statistical cross-check. Baseball Almanac is useful research material but is not sufficient as the sole authority for unusual claims. Unusual claims require an independent second source. Preserve the exact source URL, reviewer evidence, and status; do not rewrite uncertain rollback content. Before publishing new material, confirm the source's licensing/terms and use only factual data or appropriately attributed quotations under the applicable terms; the current static dataset contains no copied source text beyond short attributed-style snippets and has not had a legal/licensing review.

The game-feed transformer maps exit velocity only from a provider `hitData.launchSpeed` field when that field is present. The active GameView renders `Unavailable` otherwise; it does not use a numeric placeholder. Who's Hot does not claim exit-velocity trends because its game-log route does not provide a verified Statcast baseline.

## Build from scratch

For a reproducible clean-room setup, verification gates, provider boundaries, deployment assumptions, and troubleshooting, see [`BUILD_FROM_SCRATCH.md`](BUILD_FROM_SCRATCH.md).

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Deterministic checks

Run the pure sport adapter and normalization checks without contacting providers:

`npm test`
