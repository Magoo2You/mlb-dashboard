export const getCurrentSeason = (now: Date = new Date()): string => String(now.getFullYear());

export const CURRENT_SEASON = getCurrentSeason();
export const CURRENT_SEASON_START = `${CURRENT_SEASON}-03-20`;
export const CURRENT_SEASON_END = `${CURRENT_SEASON}-11-01`;
