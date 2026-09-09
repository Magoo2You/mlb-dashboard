# Legacy boundaries

This inventory records files that are not part of the active application path and the evidence used to quarantine or retain them. It is intentionally conservative: preserving rollback material is preferred to deletion, and an item stays in place when moving it could change a served or documented path.

## Active boundary

The supported application path is:

- `src/` and its imported data, domain, service, and sport-adapter modules
- `server.ts`
- `scripts/` used by the `npm test` command
- `package.json`, `package-lock.json`, `tsconfig.json`, and `vite.config.ts`
- production assets under `public/` and `assets/`
- current operational and experimental-support documentation under `README.md` and `docs/`

`src/components/PassiveCardSchedule.tsx` is the canonical schedule-card implementation. `src/components/PassiveScreen.tsx` imports it directly as `./PassiveCardSchedule`.

## Quarantined with `git mv`

The following files had no source import, package-script reference, Vite/public reference, or active documentation dependency found by the audit. They are retained under `legacy/` rather than deleted so their contents and Git history remain available for rollback or reference.

- `server.ts.bak` -> `legacy/server.ts.bak` — stale server backup; the active script runs `server.ts`.
- `test_accumulator_25k.js` -> `legacy/test_accumulator_25k.js` — standalone demo/scratch script; not an npm script or imported module.
- `test-response.html` -> `legacy/test-response.html` — captured/generated response page; not in `public/` and not referenced by the app.
- `download_logo.js` -> `legacy/download_logo.js` — one-off asset downloader; production assets are already checked in and the file is not scripted or imported.
- `download_mlb_logo.js` -> `legacy/download_mlb_logo.js` — one-off asset downloader; production assets are already checked in and the file is not scripted or imported.
- `lore-fetcher-more.js` -> `legacy/lore-fetcher-more.js` — abandoned experimental fetcher; not imported or scripted and uses dependencies not present in the active manifest.
- `src/components/PassiveCardSchedule-no-shuffle.tsx` -> `legacy/src/components/PassiveCardSchedule-no-shuffle.tsx` — unimported variant; the active screen imports the canonical file.
- `src/components/PassiveCardSchedule-stable.tsx` -> `legacy/src/components/PassiveCardSchedule-stable.tsx` — unimported rollback/variant; preserved outside the active source tree.
- `src/components/PassiveCardSchedule.tsx.backup` -> `legacy/src/components/PassiveCardSchedule.tsx.backup` — explicit backup of the schedule card; preserved, not deleted.
- `src/components/PassiveCardSchedule.tsx.complete` -> `legacy/src/components/PassiveCardSchedule.tsx.complete` — explicit alternate/rollback implementation; preserved, not deleted.

## Retained in place

These files were not moved because they are served, potentially addressable by a known path, or their role/data boundary is not proven safe to change:

- `public/debug.html` and `public/fix.html` — Vite copies `public/` files to the build root and the Express production server serves the built static directory. Moving them would remove the existing `/debug.html` and `/fix.html` paths.
- `SAMPLE/` — explicitly retained sample application/data tree; no move was attempted.
- `src/data/*lore*` and `src/utils/lore-*` — several overlapping lore datasets/utilities exist. `src/utils/lore-monitor.ts` imports `lore-accumulator.ts`, while the other utilities are not sufficiently proven to be disposable. No lore data or utility was moved.
- `WORK-IN-PROGRESS.md`, `WORKING-LORE-CURIOS.md`, `LORE-CURIOS-ADDITIONS.md`, `LORE-CURIOS-WORK-AREA.md`, `LORE_ACCUMULATOR_REPORT.md`, and `LORE_API_EXPLORATION_REPORT.md` — historical or working documentation retained because it describes active lore/data context and is not a safe scratch-only classification.
- `ERROR_31_RESOLVED.md`, `REACT_ERROR_31_FIX_REPORT.md`, and `WHITE-SCREEN-FIX.md` — historical incident/fix records retained; no deletion or rewrite was warranted.
- `server.log` — ignored by `.gitignore` and not tracked; no repository move was performed.

## Audit notes

The audit checked `git ls-files`, source imports/references, npm scripts, Vite/public behavior, and repository documentation. The cleanup makes no source, runtime, dependency, or public-route changes. It does not delete rollback material and does not claim that the retained lore variants are interchangeable.
