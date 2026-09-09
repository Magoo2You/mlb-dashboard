<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c2a823e5-77fb-474b-ae2b-e055e5465f10

## Dashboard modes

The passive wallboard remains the default view. The fixed **Views** tablist provides keyboard-accessible access to Schedule, Standings, Statcast, and Who's Hot; use Left/Right (or Up/Down), Home, and End to move between tabs. Every interactive view includes a **Return to wallboard** control.

The Schedule view reuses the existing date navigator and schedule cards and opens player profiles when the feed contains valid decision-player IDs. Select a game and use its **Open game feed** action to load the detailed `GameView`; it provides loading, retryable error, empty play-by-play, and return-to-schedule states. The view is mounted only after the API response satisfies the typed detail-feed contract, and no mock fallback is presented as live data.

## Sports status panel

The discoverable **Sports** view is a status-only selector built from `src/domain/sport-registry.ts`. MLB remains the only supported live sport and selecting MLB returns to the default wallboard. NFL and NHL are labeled **Experimental preview**; their incomplete adapters are not mounted and the panel shows no game data. NBA is labeled **Experimental · provider-limited**: an ESPN current-scoreboard adapter exists, but it is not UI-wired, date queries are unverified, and NBA is not playable from this panel. The panel uses native buttons, visible focus rings, arrow/Home/End navigation in the surrounding tablist, and explanatory status text so incomplete coverage is never presented as live.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Deterministic checks

Run the pure sport adapter and normalization checks without contacting providers:

`npm test`
