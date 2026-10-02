import type { ISODate, ISODateTime } from '@/types'
import { calendarToday, daysBetween } from './dates'

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
const gbpPrecise = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 })
const gbpCompact = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', notation: 'compact', maximumFractionDigits: 1 })

export function formatMoney(value: number, options: { precise?: boolean; compact?: boolean } = {}): string {
  if (options.compact) return gbpCompact.format(value)
  if (options.precise) return gbpPrecise.format(value)
  return gbp.format(value)
}

function parse(date: ISODate | ISODateTime): Date {
  return new Date(date.length === 10 ? `${date}T00:00:00` : date)
}

// Fixed month names: browsers disagree on en-GB short months ("Sep" vs "Sept").
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `10 Sep 2026` */
export function formatDate(date: ISODate | ISODateTime): string {
  const d = parse(date)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** `10 Sep` */
export function formatShortDate(date: ISODate | ISODateTime): string {
  const d = parse(date)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`
}

/** `10:42:11` */
export function formatTime(at: ISODateTime): string {
  return at.slice(11, 19)
}

export function formatDateTime(at: ISODateTime): string {
  return `${formatShortDate(at)} · ${at.slice(11, 16)}`
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** `in 2 days`, `today`, `3 days ago` relative to the demo date. */
export function relativeDay(date: ISODate): string {
  const diff = daysBetween(calendarToday(), date.slice(0, 10))
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  if (diff === -1) return 'yesterday'
  return diff > 0 ? `in ${diff} days` : `${-diff} days ago`
}

export function initials(name: string): string {
  return name
    .replace(/[^A-Za-z\s&]/g, '')
    .split(/\s+/)
    .filter((part) => part && part !== '&')
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}
