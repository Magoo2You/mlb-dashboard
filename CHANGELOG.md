# Changelog

All notable changes to the MLB Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-11

### Fixed
- Updated `index.html` title from "My Google AI Studio App" to "Todd's MLB Gameday"
- Added favicon with MLB logo: `<link rel="icon" href="/assets/mlb-logo.svg">`

### Improved
- Version notation added to `package.json` (was 0.0.0, now 1.1.0)
- Proper changelog tracking initialized

## [1.0.0] - Initial Release

### Added
- Express backend with MLB StatsAPI integration
- Schedule API endpoint (`/api/schedule`)
- Standings API endpoint (`/api/standings`)
- Live game feed API (`/api/game/:gamePk`)
- Player details API (`/api/player/:personId`)
- Statcast leaders API (`/api/statcast-leaders`)
- Who's Hot API (`/api/whos-hot`)
- News RSS feed (`/api/news`)

### Features
- Real-time MLB game data via official StatsAPI
- Team logos (MLB official CDN)
- Dark theme with team color gradients
- SPA routing with Vite
- Tailwind CSS styling
