/**
 * API dates are epoch milliseconds in UTC (months are their first day at 00:00 UTC).
 * Always read them with UTC getters: in a negative offset such as UTC-6, the local
 * calendar would place the start of a month on the last day of the previous month.
 */

export function epochYear(ms: number): number {
  return new Date(ms).getUTCFullYear()
}

/** Month of the year, 1..12. */
export function epochMonth(ms: number): number {
  return new Date(ms).getUTCMonth() + 1
}

/** `YYYY-MM-DD` in UTC. */
export function formatEpochDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}
