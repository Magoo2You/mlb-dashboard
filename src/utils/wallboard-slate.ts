import { ScheduledGame } from "../types";

const isLiveOrFinal = (game: ScheduledGame): boolean =>
  game.status?.abstractGameState === "Live" ||
  game.status?.detailedState === "In Progress" ||
  game.status?.abstractGameState === "Final" ||
  game.status?.detailedState === "Final";

const hasStarted = (game: ScheduledGame, now: Date): boolean => {
  if (isLiveOrFinal(game)) return true;
  const gameTime = new Date(game.gameDate).getTime();
  return Number.isFinite(gameTime) && gameTime <= now.getTime();
};

export function selectWallboardSlate({
  previousGames,
  todayGames,
  now = new Date(),
}: {
  previousGames: ScheduledGame[];
  todayGames: ScheduledGame[];
  now?: Date;
}): ScheduledGame[] {
  if (todayGames.some((game) => hasStarted(game, now))) return todayGames;

  const overnightCarryover = previousGames.filter(isLiveOrFinal);
  return [...overnightCarryover, ...todayGames];
}
