# Visual QA baseline — 2026-09-10

## Test boundary

- Repository: `E:\HermesMLBDashboard`
- Branch: `ChatGPT2026Version`
- Build under test: commit `1093e50973dde37ec2fe9cd80ed2414f00f365f4`
- Fresh dev server: `http://127.0.0.1:4330`
- Intended desktop viewport: 1920×1080
- Standalone browser: isolated Chrome profile, DevTools port 9341
- Embedded preview pane: inspected separately and not treated as a desktop-width baseline

## Confirmed environment observations

1. The embedded Hermes preview constrains the app to a narrow pane. This is a preview-width artifact, not evidence about the intended 1920×1080 wallboard composition.
2. The isolated Chrome target reached `Todd's MLB Gameday` and the server returned HTTP 200. The desktop capture remained visually white while the live DOM/preview read contained the application shell and content. This is recorded as a capture/compositor limitation until reproduced in a normal browser screenshot; it is not currently classified as an app rendering defect.
3. The fresh rendered shell exposes the primary wallboard navigation in this order: Scoreboard, Game Feed, AL Standings, NL Standings, Schedule, Statcast, Who's Hot, Sports.
4. The observed fallback state was honest: `Official standings are unavailable. Retry to check again.` and `No official standings are available yet.` No synthetic standings were displayed.

## Baseline hierarchy to preserve

### Wallboard

- Header: local MLB branding, current view navigation, pause control, and clock.
- Primary content: scoreboard/game feed and standings cards.
- Secondary content: schedule/news/lore and other manually selected wallboard views.
- Intentional behavior: wallboard remains fixed/clipped rather than becoming a vertically scrolling document.

### Interactive views

- Header/navigation and return-to-wallboard control.
- View title plus short live-data context.
- Controls/filter row.
- Main provider-backed content panel.
- Explicit loading, empty, unavailable, error, and retry states.
- Intentional behavior: normal document scrolling; only wide tables use horizontal overflow on narrow screens.

## Baseline findings before styling changes

| Area | Finding | Classification | Priority |
|---|---|---|---|
| Embedded preview width | Narrow pane makes desktop composition appear cramped | Environment artifact | Record only |
| Standalone screenshot | White compositor capture conflicts with readable live DOM | Environment/tooling artifact | Verify in later browser QA |
| Wallboard headline/news card | Previously identified excess blank space remains a visual target | Confirmed backlog item | Medium |
| Game Feed | Interactive card hierarchy and blank space remain a visual target | Confirmed backlog item | High |
| Standings | Numeric column geometry and long-name behavior remain visual targets | Confirmed backlog item | High |
| Interactive page density | Shared grid stretching remains a visual target independent of fixed wallboard layout | Confirmed backlog item | High |
| Data context | Source/season/date-window/freshness context remains a usability target | Confirmed backlog item | Medium |
| Controls | Selected state, keyboard discoverability, and narrow-width presentation remain review targets | Confirmed backlog item | Medium |
| Image resilience | Fallback/intrinsic sizing/broken-source behavior requires browser verification | Unverified until browser pass | Medium |

## Verification notes

The baseline was captured against a fresh server, not an existing preview process. The API/UI fallback wording was read from the live rendered page. No styling or component changes were made as part of this baseline checkpoint.

Next implementation item: shared visual tokens and the interactive Game Feed/standings geometry pass, while preserving the fixed wallboard composition and the documented intentional overflow behavior.
