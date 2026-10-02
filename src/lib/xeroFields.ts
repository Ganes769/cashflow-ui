import { calendarToday, daysOverdue } from '@/lib/dates'
import type { XeroSyncedContact, XeroSyncedInvoice } from '@/api/types'

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function pick(obj: Record<string, unknown> | null | undefined, ...keys: string[]): unknown {
  if (!obj) return undefined
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key]
  }
  return undefined
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function str(value: unknown): string {
  return value == null ? '' : String(value)
}

function dateOnly(value: unknown): string {
  if (value == null || value === '') return ''
  if (typeof value === 'number') return new Date(value).toISOString().slice(0, 10)
  const text = String(value)
  const ms = text.match(/\/Date\((-?\d+)/)
  if (ms) return new Date(Number(ms[1])).toISOString().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  const parsed = Date.parse(text)
  return Number.isNaN(parsed) ? '' : new Date(parsed).toISOString().slice(0, 10)
}

export const XERO_INVOICE_STATUSES = ['DRAFT', 'SUBMITTED', 'AUTHORISED', 'PAID', 'VOIDED'] as const
export type XeroInvoiceStatus = (typeof XERO_INVOICE_STATUSES)[number]

export type InvoiceListFilter = 'all' | 'unpaid' | 'paid' | 'overdue'

export function activeContacts(rows: XeroSyncedContact[] | undefined): XeroSyncedContact[] {
  return (rows ?? []).filter((row) => !row.deleted)
}

export function activeInvoices(rows: XeroSyncedInvoice[] | undefined): XeroSyncedInvoice[] {
  return (rows ?? []).filter((row) => !row.deleted)
}

export function invoicePayload(row: XeroSyncedInvoice): Record<string, unknown> {
  return row.payload ?? {}
}

export function invoiceContactName(row: XeroSyncedInvoice): string {
  const payload = invoicePayload(row)
  const contact = asRecord(pick(payload, 'Contact', 'contact')) ?? {}
  return str(pick(contact, 'Name', 'name') || '—')
}

export function invoiceAmount(row: XeroSyncedInvoice): number {
  const payload = invoicePayload(row)
  const due = num(pick(payload, 'AmountDue', 'amount_due'))
  const total = num(pick(payload, 'Total', 'total'))
  return due || total
}

export function invoiceDueDate(row: XeroSyncedInvoice): string {
  return dateOnly(pick(invoicePayload(row), 'DueDate', 'due_date'))
}

export function invoiceXeroStatus(row: XeroSyncedInvoice): string {
  return str(row.status || pick(invoicePayload(row), 'Status', 'status')).toUpperCase()
}

export function isPaidInvoice(row: XeroSyncedInvoice): boolean {
  const status = invoiceXeroStatus(row)
  const due = num(pick(invoicePayload(row), 'AmountDue', 'amount_due'))
  return status === 'PAID' || status === 'VOIDED' || (status !== 'DRAFT' && due <= 0 && num(pick(invoicePayload(row), 'AmountPaid', 'amount_paid')) > 0)
}

export function isUnpaidInvoice(row: XeroSyncedInvoice): boolean {
  const status = invoiceXeroStatus(row)
  if (status === 'PAID' || status === 'VOIDED' || status === 'DELETED') return false
  return invoiceAmount(row) > 0 || status === 'AUTHORISED' || status === 'SUBMITTED' || status === 'DRAFT'
}

export function isOverdueInvoice(row: XeroSyncedInvoice): boolean {
  if (!isUnpaidInvoice(row) || isPaidInvoice(row)) return false
  const due = invoiceDueDate(row)
  return Boolean(due) && daysOverdue(due, calendarToday()) > 0
}

export function matchesInvoiceFilter(row: XeroSyncedInvoice, filter: InvoiceListFilter): boolean {
  if (filter === 'paid') return isPaidInvoice(row)
  if (filter === 'unpaid') return isUnpaidInvoice(row)
  if (filter === 'overdue') return isOverdueInvoice(row)
  return true
}

export function invoiceStatusTone(status: string): 'muted' | 'sun' | 'peach' | 'lime' | 'coral' {
  switch (status) {
    case 'PAID':
      return 'lime'
    case 'AUTHORISED':
      return 'peach'
    case 'SUBMITTED':
      return 'sun'
    case 'VOIDED':
    case 'DELETED':
      return 'coral'
    default:
      return 'muted'
  }
}
