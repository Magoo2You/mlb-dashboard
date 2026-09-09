import type { SportId } from './sports';

export type DashboardMode = 'wallboard' | 'schedule' | 'standings' | 'statcast' | 'hot' | 'sports';

export const DASHBOARD_MODES: readonly DashboardMode[] = [
  'wallboard',
  'schedule',
  'standings',
  'statcast',
  'hot',
  'sports',
];

/** Return the mode selected by a tablist arrow/Home/End navigation action. */
export function getAdjacentDashboardMode(mode: DashboardMode, offset: number): DashboardMode {
  const index = DASHBOARD_MODES.indexOf(mode);
  const nextIndex = (index + offset + DASHBOARD_MODES.length) % DASHBOARD_MODES.length;
  return DASHBOARD_MODES[nextIndex];
}

/** MLB is the only selectable live sport; previews leave the current dashboard mode unchanged. */
export function getModeAfterSportSelection(currentMode: DashboardMode, sport: SportId): DashboardMode {
  return sport === 'mlb' ? 'wallboard' : currentMode;
}
