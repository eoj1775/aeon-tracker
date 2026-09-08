// Core mission parameters for the AEON.NETWORK tracker.
// Keep this the single source of truth — the UI and API both read from here.

export const SUBREDDIT = "spx6900";
export const TARGET_SUBSCRIBERS = 69000;
// ISO date string, UTC. 8 March 2027.
export const DEADLINE_ISO = "2027-03-08T00:00:00Z";

export function daysRemaining(now: Date = new Date()): number {
  const deadline = new Date(DEADLINE_ISO);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / msPerDay));
}
