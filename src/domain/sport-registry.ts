import type {
  SportAdapter,
  SportAvailability,
  SportCapabilities,
  SportId,
} from './sports';

const MLB_CAPABILITIES: SportCapabilities = {
  schedules: true,
  liveScores: true,
  standings: true,
  teams: true,
  players: true,
  playByPlay: true,
  news: true,
  highlights: true,
};

const UNAVAILABLE_CAPABILITIES: SportCapabilities = {
  schedules: false,
  liveScores: false,
  standings: false,
  teams: false,
  players: false,
  playByPlay: false,
  news: false,
  highlights: false,
};

/**
 * MLB is the only wired adapter today. Its methods remain optional here so
 * this foundation does not duplicate or wrap the existing MLB service layer.
 */
export const mlbAdapter: SportAdapter = {
  id: 'mlb',
  availability: 'supported',
  capabilities: MLB_CAPABILITIES,
};

const experimentalAdapter = (id: Exclude<SportId, 'mlb'>): SportAdapter => ({
  id,
  availability: 'experimental',
  capabilities: UNAVAILABLE_CAPABILITIES,
});

export interface SportRegistryEntry {
  id: SportId;
  displayName: string;
  availability: SportAvailability;
  statusLabel: string;
  statusDescription: string;
  adapter: SportAdapter;
  capabilities: SportCapabilities;
}

export const sportRegistry: Readonly<Record<SportId, SportRegistryEntry>> = {
  mlb: {
    id: 'mlb',
    displayName: 'Major League Baseball',
    availability: 'supported',
    statusLabel: 'Supported',
    statusDescription: 'Official MLB feeds power the wallboard and interactive views.',
    adapter: mlbAdapter,
    capabilities: MLB_CAPABILITIES,
  },
  nfl: {
    id: 'nfl',
    displayName: 'National Football League',
    availability: 'experimental',
    statusLabel: 'Experimental preview',
    statusDescription: 'A read-only adapter is being evaluated. No NFL data is shown in this shell yet.',
    adapter: experimentalAdapter('nfl'),
    capabilities: UNAVAILABLE_CAPABILITIES,
  },
  nba: {
    id: 'nba',
    displayName: 'National Basketball Association',
    availability: 'experimental',
    statusLabel: 'Experimental · provider-limited',
    statusDescription: 'An ESPN current-scoreboard adapter exists, but it is not UI-wired; date queries are unverified, so NBA is not playable here.',
    adapter: experimentalAdapter('nba'),
    capabilities: UNAVAILABLE_CAPABILITIES,
  },
  nhl: {
    id: 'nhl',
    displayName: 'National Hockey League',
    availability: 'experimental',
    statusLabel: 'Experimental preview',
    statusDescription: 'Experimental read-only schedule preview only. Provider availability is checked at request time; NHL is not a supported dashboard.',
    adapter: experimentalAdapter('nhl'),
    capabilities: UNAVAILABLE_CAPABILITIES,
  },
};

export const getSport = (id: SportId): SportRegistryEntry => sportRegistry[id];
