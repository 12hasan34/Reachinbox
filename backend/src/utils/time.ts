export function getDelayUntilNextHour(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(now.getHours() + 1);

  return nextHour.getTime() - now.getTime();
}