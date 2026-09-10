# Who's Hot live review — 2026-09-10

## Test boundary

- Repository: `E:\HermesMLBDashboard`
- Branch: `ChatGPT2026Version`
- Fresh API server: `http://127.0.0.1:4331`
- Endpoint: `/api/whos-hot`
- Provider: MLB Stats API through the application adapter

## Results

| Request | HTTP/body result | Finding |
|---|---|---|
| `season=2026&timeframe=14` | HTTP 200; valid JSON; six aggregate hitters, six aggregate pitchers, six surge hitters, six surge pitchers | Pass |
| `season=2026&timeframe=60` | HTTP 200; valid JSON; `timeframe: "60"`; six records in each bucket | Pass; 60-day route/UI contract works |
| `season=2026&startDate=2026-08-01&endDate=2026-09-10` | HTTP 200; valid JSON; explicit `startDate`/`endDate`; six records in each bucket | Pass; custom range is provider-backed |
| `season=2026&timeframe=999` | HTTP 400; JSON `{ "error": "Invalid request parameters" }` | Pass; invalid preset is rejected honestly |
| `season=2026&startDate=2026-09-10&endDate=2026-08-01` | HTTP 400; JSON `{ "error": "Invalid request parameters" }` | Pass; reversed range is rejected honestly |

## Data/context checks

- Response buckets are arrays and contain evidence-oriented fields such as recent values, baseline values, sample/game context, and reason text.
- The custom-range response carries the selected dates. Its compatibility `timeframe: "14"` field remains present but the UI context uses the explicit custom dates rather than presenting that default as the selected span.
- No synthetic scores, statistics, or trend explanations were observed in the response contract.
- The UI now exposes the provider, selected preset/custom scope, current-season baseline, and freshness event.

## Decision

No Who's Hot production code change was required by this live review. The route, invalid-state handling, selected-window contract, and context presentation passed the bounded check. Remaining work is broader browser visual/accessibility QA across controls, loading states, narrow widths, keyboard navigation, and reduced motion.
