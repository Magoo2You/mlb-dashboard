export const formatLocalDate = (now: Date = new Date()): string => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const shiftLocalDate = (date: string, days: number): string => {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(year, month - 1, day, 12, 0, 0, 0);
  shifted.setDate(shifted.getDate() + days);
  return formatLocalDate(shifted);
};
