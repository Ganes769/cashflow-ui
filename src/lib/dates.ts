import type { ISODate, ISODateTime } from '@/types'

/**
 * The demo runs against a fixed "today" so days-overdue figures in the story
 * (e.g. INV-48291 being 18 days overdue) stay stable regardless of the real date.
 * Replace with `new Date()` once data comes from a live backend.
 */
export const DEMO_TODAY: ISODate = '2026-09-28'

/** Calendar date in UTC, for live Xero ageing. */
export function calendarToday(): ISODate {
  return new Date().toISOString().slice(0, 10)
}

const DAY_MS = 86_400_000

function toUtc(date: ISODate): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function addDays(date: ISODate, days: number): ISODate {
  return new Date(toUtc(date) + days * DAY_MS).toISOString().slice(0, 10)
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS)
}

export function daysOverdue(dueDate: ISODate, today: ISODate = DEMO_TODAY): number {
  return Math.max(0, daysBetween(dueDate, today))
}

/** Current demo clock time, anchored to DEMO_TODAY. */
export function demoNow(): ISODateTime {
  const now = new Date()
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
  return `${DEMO_TODAY}T${time}`
}
