# Build From Scratch

This is a reproducible clean-room build guide for the verified `ChatGPT2026Version` branch. It describes how to recreate the current project from repository contents; it does **not** claim that the project was rebuilt from scratch during this documentation change.

The active product is a React 19 + Vite frontend served by an Express 5 server. MLB is the supported live path. NHL, NFL, and NBA are explicitly labeled experimental or provider-limited read-only previews. Provider availability, schemas, rate limits, and terms can change.

## 1. Scope and document boundaries

Use this file to create a new checkout and reach a verified local build. Use the other documents for different purposes:

- [`README.md`](README.md): short current-user overview and local start commands.
- [`DEPLOYMENT.md`](DEPLOYMENT.md): historical Render deployment runbook. Check every branch, service, and environment value before using it; its example currently names `master`, while this verified branch is `ChatGPT2026Version`.
- [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md): current verified status, limitations, and deferred work; it is not a build recipe.
- [`docs/multi-sport-architecture.md`](docs/multi-sport-architecture.md): provider-neutral architecture rules.
- [`docs/nhl-web-api-experimental.md`](docs/nhl-web-api-experimental.md), [`docs/nfl-espn-scoreboard-experimental.md`](docs/nfl-espn-scoreboard-experimental.md), and [`docs/nba-scoreboard-experimental.md`](docs/nba-scoreboard-experimental.md): provider observations and limits.
- [`docs/LEGACY_BOUNDARIES.md`](docs/LEGACY_BOUNDARIES.md): active versus quarantined, retained, historical, and sample files. Do not use `legacy/` or `SAMPLE/` as active implementation sources.

The build order below is for a clean implementation from the active boundary. It is not a prescription to copy backups, scratch scripts, old reports, or the sample tree.

## 2. Prerequisites

Install these before cloning or building:

- Git.
- Node.js with npm. Use a current supported LTS release; the repository has no `.nvmrc`, so record the version used for a release build.
- A Windows shell that can run npm and the commands below. Git Bash or WSL is recommended. The commands are POSIX/bash-compatible; use forward-slash paths in Git Bash/WSL.
- Network access to the npm registry for installation. Runtime live-data checks additionally need outbound HTTPS access to provider hosts.

The project does not require a database, Python environment, browser automation package, API key, or local service account for its deterministic test/build gates.

## 3. Clean checkout and dependency installation

### Git Bash on Windows or WSL

```bash
cd /e
# Use the repository URL and branch when creating a new checkout.
git clone --branch ChatGPT2026Version https://github.com/Magoo2You/mlb-dashboard.git HermesMLBDashboard
cd /e/HermesMLBDashboard

git status --short --branch
node --version
npm --version
npm ci
```

If the repository already exists, use a clean checkout instead:

```bash
cd /e/HermesMLBDashboard
git fetch origin
git switch ChatGPT2026Version
git pull --ff-only origin ChatGPT2026Version
npm ci
```

`npm ci` uses the committed `package-lock.json`. Use `npm install` only when intentionally changing dependencies and the lockfile. Do not copy `node_modules`, `dist`, caches, `.env`, or files from `legacy/` into a clean build.

### Windows path note

In Git Bash, `E:\HermesMLBDashboard` is `/e/HermesMLBDashboard`. In WSL, the same drive is commonly `/mnt/e/HermesMLBDashboard`. Run `npm` from the repository root. `npm run clean` uses `rm -rf`, so use Git Bash/WSL for that script rather than PowerShell.

## 4. Environment and configuration

Copy the template only if a local environment file is useful for your deployment workflow:

```bash
cd /e/HermesMLBDashboard
cp .env.example .env
```

Do not commit `.env`. `.gitignore` ignores `.env*` while allowing `.env.example`.

Current configuration facts, verified from the active entrypoints:

- `PORT` is read directly by `server.ts`; it defaults to `3000`. Example: `PORT=4173 npm run dev`.
- `NODE_ENV=production` selects static serving from `dist/` after the production build. Without it, the server mounts Vite middleware.
- `DISABLE_HMR=true` disables Vite HMR and file watching in `vite.config.ts`; it can help when an editor or another Vite process causes file-watch/HMR collisions.
- The active `server.ts` does not import or call `dotenv.config()`. Therefore, creating `.env` alone does not make variables available to the running process; export variables in the shell or configure them in the hosting platform.
- `.env.example` contains `GEMINI_API_KEY` and `APP_URL` for historical/hosting context. Gemini was removed from the active integration, and the current server does not use either value. Never invent a key or treat those placeholders as credentials.

Examples:

```bash
# Git Bash/WSL: one process only
PORT=3000 NODE_ENV=development npm run dev

# Disable HMR/file watching for an agent/editing session
DISABLE_HMR=true npm run dev

# Production process after building
NODE_ENV=production PORT=3000 npm start
```

For a Windows GUI host, set `PORT`, `NODE_ENV`, and any future approved variables in the service's environment configuration. Do not place secrets in source, browser-exposed Vite variables, logs, or committed documentation.

## 5. Active project structure and creation order

Create or restore the active boundary in this order so each layer has a verification point:

1. **Tooling and shell:** `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, and `index.html`.
2. **Server boundary:** `server.ts`, including input validation, same-origin API routes, provider timeouts/error handling, generic client errors, and production static serving.
3. **Shared domain contracts:** `src/types.ts`, `src/domain/sports.ts`, `src/domain/sport-registry.ts`, and `src/domain/dashboard-navigation.ts`.
4. **Provider adapters and pure transforms:** `src/sports/mlb/`, `src/sports/nhl/`, `src/sports/nfl/`, and `src/sports/nba/`. Keep provider URLs, IDs, status mappings, date semantics, and capability decisions inside adapters/contracts.
5. **Client service boundary:** `src/services/api.ts`; browser code calls same-origin routes rather than provider hosts directly.
6. **React entrypoint and UI:** `src/main.tsx`, `src/App.tsx`, `src/index.css`, then `src/components/`. Keep wallboard and interactive layouts separate and expose loading, empty, unavailable, stale, and error states.
7. **Checked-in active assets/data:** `public/`, `assets/`, and only imported data required by the active application.
8. **Deterministic checks:** `src/**/**-checks.ts`, fixtures, and the two scripts in `scripts/`.

The active entrypoints are `src/main.tsx` for the browser, `server.ts` for Express/Vite, and `scripts/run-normalization-checks.ts` plus `scripts/run-browserless-smoke-checks.ts` for `npm test`. `legacy/`, `SAMPLE/`, unimported variants, backups, incident reports, and lore working files are not a substitute for the active creation order; see [`docs/LEGACY_BOUNDARIES.md`](docs/LEGACY_BOUNDARIES.md).

## 6. Verification gates and milestone order

Run gates from the repository root. Stop at the first failed gate and fix the cause before proceeding.

### Gate A — deterministic tests

```bash
npm test
```

This runs pure NHL, NFL, NBA, ESPN-NBA, and MLB transformer checks, browserless navigation/API contract checks, error-boundary checks, request coalescing checks, and mocked provider response handling. It does not contact live providers and is not a browser-rendering test.

### Gate B — TypeScript/lint gate

```bash
npm run lint
```

This is the repository's current lint/type gate (`tsc --noEmit`) over the configured application entrypoints and their imports. It is not an ESLint invocation.

### Gate C — dependency audit

```bash
npm audit --omit=dev --audit-level=moderate
```

Review all findings rather than blindly applying upgrades. A clean result is evidence for the installed lockfile, not a guarantee about future transitive releases or provider security.

### Gate D — production build

```bash
npm run build
test -f dist/index.html
test -f dist/server.cjs
```

The build runs Vite and bundles `server.ts` to `dist/server.cjs`. Do not serve `dist/server.cjs.map` or expose server source through the static route.

### Gate E — local HTTP smoke

Start a separate process in Git Bash/WSL:

```bash
NODE_ENV=production PORT=4173 npm start
```

In a second shell, verify the static app and same-origin boundary:

```bash
curl -fsS http://127.0.0.1:4173/ >/dev/null
curl -fsS http://127.0.0.1:4173/ | grep -q 'id="root"'
curl -i 'http://127.0.0.1:4173/api/schedule?date=not-a-date'
```

The first two commands must succeed. The API validation probe must return HTTP `400` with a generic invalid-parameter response; it must not require provider access. Stop the process cleanly after the check. For live provider smoke, use the same-origin routes only and treat a provider error or empty day as a real unavailable/empty state, never as permission to add mock data.

For a development/HMR smoke instead:

```bash
PORT=4173 npm run dev
curl -fsS http://127.0.0.1:4173/ >/dev/null
```

### Gate F — repository hygiene

```bash
git diff --check
git status --short
```

No whitespace errors, credentials, `.env`, `node_modules`, `dist`, logs, or scratch probes belong in the commit. Run the complete gate again after any source or dependency change.

## 7. Production run and deployment assumptions

Build and run the bundled server:

```bash
npm ci
npm run build
NODE_ENV=production PORT=3000 npm start
```

The host must route traffic to the process's `PORT`, allow outbound HTTPS to the provider hosts, preserve the `dist/` directory produced by the build, and provide a health/readiness check that confirms the process is listening. The Express server binds to `0.0.0.0` and serves the Vite output plus same-origin `/api/*` routes.

The existing [`DEPLOYMENT.md`](DEPLOYMENT.md) is a Render-oriented runbook, not proof of a current deployment. Its build command is `npm install && npm run build` and its start command is `node dist/server.cjs`; for reproducibility prefer `npm ci` when the lockfile is available. Before deploying, explicitly select the intended branch, set `NODE_ENV=production`, let the platform assign or explicitly set `PORT`, and confirm the service's actual public URL. `APP_URL` is not read by the current active server. No deployment, domain, provider account, or credential is assumed by this guide.

## 8. Provider and sport boundaries

| Sport | Current boundary | What a clean build may claim |
|---|---|---|
| **MLB** | StatsAPI plus MLB RSS/content routes behind `server.ts`; active production path. | Schedule, game feed, standings, player details, ticker/news/highlights, Statcast leader and Who's Hot routes are implemented, subject to provider response variation. Validate/transform payloads; never silently substitute fixtures. |
| **NHL** | NHL Web API `https://api-web.nhle.com/v1`, same-origin date schedule preview only. | Experimental schedule preview only. The endpoint is undocumented/unsupported, user-agent behavior affected observed access, and no standings/play-by-play/authentication/persistence/live polling is claimed. |
| **NFL** | ESPN public scoreboard endpoint, same-origin current scoreboard preview only. | Experimental current scoreboard only. No date query is exposed by the route, and no standings, rosters, drives, play-by-play, news, highlights, retries, caching, or provider guarantee is claimed. |
| **NBA** | ESPN current scoreboard adapter foundation; NBA.com candidate was provider-limited. | Experimental/provider-limited status only. Date semantics, standings, leaders, play-by-play, and NBA.com anonymous access are unverified; do not present fixtures as live. |

All provider requests are read-only in the current application. A public or HTTP-200 endpoint is not a contract: verify status, JSON shape, identity, freshness, rate behavior, terms, and user-visible empty/error states before enabling a capability. Keep sport-specific details in adapters and shared contracts; do not copy MLB assumptions into other sports.

## 9. Security and data-trust rules

- Keep secrets server-side and out of Git, browser bundles, URLs, logs, screenshots, and error responses. Use platform secret storage; `.env` is local-only.
- Validate dates, seasons, numeric IDs, query types, and request body size at the server boundary. Return generic client errors; log only what is safe for operators.
- Use same-origin server routes as the browser boundary. Do not add direct browser calls to undocumented providers to bypass validation or CORS.
- Enforce timeouts and reject non-2xx, invalid JSON, malformed records, and wrong-sport payloads. A transport success is not data validation.
- Never present stale, synthetic, demo, or fallback MLB data as live provider data. Empty, blocked, or unavailable results must remain visibly empty/unavailable.
- Preserve provider and sport capability labels. Enable a new UI capability only after fixtures, normalization, identity, freshness, and live read-only checks justify it.
- Keep response/cache bounds and request coalescing process-local assumptions explicit; do not infer multi-instance coordination from the current implementation.
- Review dependency audit output and lockfile changes before upgrades. Do not run arbitrary legacy downloaders or scripts as part of a clean build.

## 10. Troubleshooting

### Port already in use

Identify the owner before stopping anything. On Git Bash/Windows, use:

```bash
netstat -ano | grep ':3000'
```

Then inspect the PID with Windows Task Manager or `tasklist /FI "PID eq <PID>"`. Prefer an alternate port rather than killing an unrelated process:

```bash
PORT=4173 npm run dev
# or
NODE_ENV=production PORT=4173 npm start
```

Verify the selected port with `curl` before interpreting a response as this checkout.

### HMR collision, flicker, or duplicate Vite servers

Run only one dev server for the checkout. Check the port first. If an editor/agent is rewriting files or file watching is unstable:

```bash
DISABLE_HMR=true PORT=4173 npm run dev
```

This disables HMR and Vite file watching; it is not a production setting. A delayed shutdown message is not proof of a duplicate server—check the listener and endpoint.

### `npm ci` or build fails

Confirm Node/npm versions, that the shell is at the repository root, and that the lockfile is present. Remove only generated local state and retry:

```bash
rm -rf node_modules dist
npm ci
npm run lint
npm run build
```

Do not delete or regenerate the lockfile merely to hide a resolution failure.

### API is empty or unavailable

Run a deterministic test first. Then check the exact same-origin route, provider reachability, HTTP status, timeout, response shape, and date semantics. NHL and ESPN access can vary by network and headers; NBA.com was observed provider-limited. Do not add mock fallback or call provider URLs from the browser.

### Production returns a blank page

Confirm `npm run build` created `dist/index.html`, the process has `NODE_ENV=production`, the start command is `node dist/server.cjs` or `npm start`, and the process is serving the same `dist/` directory from which it was built. Check the root response and server log without exposing secrets.

## 11. Browser testing, permissions, and deferred work

The committed test suite is browserless and deterministic. It does not prove real DOM layout, focus behavior, image loading/fallback paint, responsive scrolling, lazy view mounting, error-boundary activation/reload, or visual correctness. Those require a real browser or desktop preview and are not claimed as completed by this guide.

Live provider checks require outbound network permission and may be blocked, rate-limited, schema-changing, or terms-restricted. Production deployment requires access to the hosting account, repository integration, environment configuration, domain/DNS controls, and permission to observe logs. None of those permissions is implied here.

Deferred or not currently verified include full NHL/NFL/NBA coverage, date navigation where explicitly disabled, standings/rosters/leaders/play-by-play for experimental sports, provider authentication and rate-limit guarantees, multi-process cache coordination, optional MLB hydration fields, and a full browser/device visual test runner. Track changes in [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) and update this guide when the active build boundary changes.

## 12. Rebuild completion checklist

- [ ] Clean `ChatGPT2026Version` checkout created.
- [ ] `npm ci` completed from the committed lockfile.
- [ ] No credentials or `.env` files committed.
- [ ] `npm test` passed.
- [ ] `npm run lint` passed.
- [ ] `npm audit --omit=dev --audit-level=moderate` reviewed.
- [ ] `npm run build` passed and produced `dist/index.html` and `dist/server.cjs`.
- [ ] Local HTTP root and invalid-input smoke checks passed on a verified port.
- [ ] `git diff --check` and staged-file review passed.
- [ ] Browser, provider, and deployment permission-dependent work is recorded as verified, limited, or deferred rather than implied.
