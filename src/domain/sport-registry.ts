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

const plannedAdapter = (id: Exclude<SportId, 'mlb'>): SportAdapter => ({
  id,
  availability: 'planned',
  capabilities: UNAVAILABLE_CAPABILITIES,
});

export interface SportRegistryEntry {
  id: SportId;
  displayName: string;
  availability: SportAvailability;
  adapter: SportAdapter;
  capabilities: SportCapabilities;
}

export const sportRegistry: Readonly<Record<SportId, SportRegistryEntry>> = {
  mlb: {
    id: 'mlb',
    displayName: 'Major League Baseball',
    availability: 'supported',
    adapter: mlbAdapter,
    capabilities: MLB_CAPABILITIES,
  },
  nfl: {
    id: 'nfl',
    displayName: 'National Football League',
    availability: 'planned',
    adapter: plannedAdapter('nfl'),
    capabilities: UNAVAILABLE_CAPABILITIES,
  },
  nba: {
    id: 'nba',
    displayName: 'National Basketball Association',
    availability: 'planned',
    adapter: plannedAdapter('nba'),
    capabilities: UNAVAILABLE_CAPABILITIES,
  },
  nhl: {
    id: 'nhl',
    displayName: 'National Hockey League',
    availability: 'planned',
    adapter: plannedAdapter('nhl'),
    capabilities: UNAVAILABLE_CAPABILITIES,
  },
};

export const getSport = (id: SportId): SportRegistryEntry => sportRegistry[id];
