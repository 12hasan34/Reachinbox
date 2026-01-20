export function getNextHourTimestamp(): number {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return now.getTime();
}
