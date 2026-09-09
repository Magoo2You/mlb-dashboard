<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c2a823e5-77fb-474b-ae2b-e055e5465f10

## Dashboard modes

The passive wallboard remains the default view. The fixed **Views** tablist provides keyboard-accessible access to Schedule, Standings, Statcast, and Who's Hot; use Left/Right (or Up/Down), Home, and End to move between tabs. Every interactive view includes a **Return to wallboard** control.

The Schedule view reuses the existing date navigator and schedule cards and opens player profiles when the feed contains valid decision-player IDs. Select a game and use its **Open game feed** action to load the detailed `GameView`; it provides loading, retryable error, empty play-by-play, and return-to-schedule states. The view is mounted only after the API response satisfies the typed detail-feed contract, and no mock fallback is presented as live data.

The Statcast view uses season-scoped MLB StatsAPI leaderboards with separate `statGroup=hitting`, `statGroup=pitching`, and `statGroup=fielding` requests, each with explicit `statType=season`. Accessible Hitting, Pitching, and Fielding tabs keep categories in their verified provider scopes. Hitting cards are home runs, OPS, batting average, RBI, and stolen bases; Pitching cards are ERA, strikeouts, WHIP, wins, and saves. WHIP is mapped from the provider's `walksAndHitsPerInningPitched` category. Fielding cards are fielding percentage, putouts (`putOuts`), assists, and errors. Provider ordering is preserved: descending for counting/high-rate leaderboards and ascending for ERA/WHIP. The provider payload does not expose qualification metadata, so the dashboard makes no qualification claim, invents no values, and defers additional qualification-dependent categories.

Interactive views use a separate responsive shell: narrow screens and browser zoom can scroll vertically without changing the passive wallboard's fixed broadcast canvas. Schedule cards collapse to one column on small widths; standings, inning linescores, and box-score tables retain readable columns in horizontal scrollers with a visible narrow-screen scroll hint. Very wide tables remain horizontally scrollable on desktop; their dense column sets are not converted to card layouts.

## Who's Hot data contract

The Who's Hot view reads the live `/api/whos-hot` route only. Its **WHY** explanation is deterministic and provider-backed: hitter cards use recent game-log AB/H/HR/RBI/BB/HBP/SF/total bases/SB plus available season OPS/AVG/SLG/OBP and BB/PA baselines; pitcher cards use IP/ER/SO/BB/H plus available season ERA/WHIP baselines. Each explanation includes its game sample and date span. Missing baselines are shown as unavailable rather than filled with defaults, and the commentary describes observed statistical associations—not causes or unsupported Statcast metrics. `primaryReason`/`hotReason` carry WHY and `statHighlights`/`breakoutNotes` carry separate evidence;


The discoverable **Sports** view is a status-only selector built from `src/domain/sport-registry.ts`. MLB remains the only supported live sport and selecting MLB returns to the default wallboard. NFL is labeled **Experimental preview** and shows only validated current scoreboard data through a same-origin route, with loading/error/empty states; standings, rosters, drives, and play-by-play are not exposed. NHL remains an experimental schedule preview. NBA is labeled **Experimental · provider-limited** and shows only validated current ESPN scoreboard data through a same-origin route, with loading/error/empty states; date navigation, standings, leaders, and play-by-play are not exposed. The panel uses native buttons, visible focus rings, arrow/Home/End navigation in the surrounding tablist, and explanatory status text so incomplete coverage is never presented as supported live data.

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
