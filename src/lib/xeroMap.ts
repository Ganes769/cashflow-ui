import type { Customer, InvoiceLine, InvoiceRow, InvoiceStatus, RiskLevel } from '@/types'
import { calendarToday, daysBetween, daysOverdue } from '@/lib/dates'
import { xeroCity, xeroContactName, xeroPhone } from '@/lib/xeroDisplay'
import type { XeroContact, XeroSyncedContact, XeroSyncedInvoice } from '@/api/types'

function pick(obj: Record<string, unknown> | null | undefined, ...keys: string[]): unknown {
  if (!obj) return undefined
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key]
  }
  return undefined
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
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

export function xeroContactFromPayload(payload: Record<string, unknown> | null | undefined, fallback?: Partial<XeroContact>): XeroContact {
  const p = payload ?? {}
  const contactId = str(pick(p, 'ContactID', 'contact_id', 'id') ?? fallback?.contact_id)
  return {
    contact_id: contactId,
    account_number: (pick(p, 'AccountNumber', 'account_number') as string | null | undefined) ?? fallback?.account_number ?? null,
    contact_status: (pick(p, 'ContactStatus', 'contact_status') as string | null | undefined) ?? fallback?.contact_status ?? null,
    name: str(pick(p, 'Name', 'name') ?? fallback?.name),
    first_name: (pick(p, 'FirstName', 'first_name') as string | null | undefined) ?? fallback?.first_name ?? null,
    last_name: (pick(p, 'LastName', 'last_name') as string | null | undefined) ?? fallback?.last_name ?? null,
    company_number: (pick(p, 'CompanyNumber', 'company_number') as string | null | undefined) ?? fallback?.company_number ?? null,
    email_address: (pick(p, 'EmailAddress', 'email_address', 'email') as string | null | undefined) ?? fallback?.email_address ?? null,
    tax_number: (pick(p, 'TaxNumber', 'tax_number') as string | null | undefined) ?? fallback?.tax_number ?? null,
    website: (pick(p, 'Website', 'website') as string | null | undefined) ?? fallback?.website ?? null,
    is_customer: (pick(p, 'IsCustomer', 'is_customer') as boolean | null | undefined) ?? fallback?.is_customer ?? null,
    is_supplier: (pick(p, 'IsSupplier', 'is_supplier') as boolean | null | undefined) ?? fallback?.is_supplier ?? null,
    default_currency: (pick(p, 'DefaultCurrency', 'default_currency') as string | null | undefined) ?? fallback?.default_currency ?? null,
    updated_date_utc: (pick(p, 'UpdatedDateUTC', 'updated_date_utc') as string | null | undefined) ?? fallback?.updated_date_utc ?? null,
    contact_persons: (pick(p, 'ContactPersons', 'contact_persons') as XeroContact['contact_persons']) ?? fallback?.contact_persons ?? null,
    addresses: (pick(p, 'Addresses', 'addresses') as XeroContact['addresses']) ?? fallback?.addresses ?? null,
    phones: (pick(p, 'Phones', 'phones') as XeroContact['phones']) ?? fallback?.phones ?? null,
  }
}

export function syncedContactToXero(row: XeroSyncedContact): XeroContact | null {
  if (row.deleted) return null
  return xeroContactFromPayload(row.payload, {
    contact_id: row.id,
    name: row.name ?? '',
    email_address: row.email,
  })
}

function invoiceStatus(xeroStatus: string, amountDue: number, dueDate: string): InvoiceStatus {
  const s = xeroStatus.toUpperCase()
  if (s === 'PAID' || amountDue <= 0) return 'paid'
  if (s === 'VOIDED' || s === 'DELETED' || s === 'DRAFT') return 'current'
  if (!dueDate) return amountDue > 0 ? 'overdue' : 'current'
  const overdue = daysOverdue(dueDate, calendarToday())
  if (overdue > 0) return 'overdue'
  const untilDue = daysBetween(calendarToday(), dueDate)
  if (untilDue >= 0 && untilDue <= 7) return 'due_soon'
  return 'current'
}

function riskFromOverdue(days: number, status: InvoiceStatus): RiskLevel {
  if (status === 'disputed') return 'high'
  if (days > 21) return 'high'
  if (days > 7) return 'medium'
  return 'low'
}

function linesFromPayload(payload: Record<string, unknown>): InvoiceLine[] {
  const raw = pick(payload, 'LineItems', 'line_items')
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const row = asRecord(item) ?? {}
    return {
      description: str(pick(row, 'Description', 'description') || 'Line'),
      quantity: num(pick(row, 'Quantity', 'quantity')) || 1,
      unitPrice: num(pick(row, 'UnitAmount', 'unit_amount', 'unitPrice')),
    }
  })
}

export function mapSyncedInvoice(row: XeroSyncedInvoice): InvoiceRow | null {
  if (row.deleted) return null
  const payload = row.payload ?? {}
  const type = str(pick(payload, 'Type', 'type')).toUpperCase()
  if (type === 'ACCPAY') return null

  const contact = asRecord(pick(payload, 'Contact', 'contact')) ?? {}
  const invoiceNumber = str(row.invoice_number || pick(payload, 'InvoiceNumber', 'invoice_number') || row.id)
  const dueDate = dateOnly(pick(payload, 'DueDate', 'due_date')) || dateOnly(row.updated_at)
  const invoiceDate = dateOnly(pick(payload, 'Date', 'date', 'InvoiceDate')) || dueDate
  const amountDue = num(pick(payload, 'AmountDue', 'amount_due'))
  const amount = num(pick(payload, 'Total', 'total')) || amountDue
  const amountPaid = num(pick(payload, 'AmountPaid', 'amount_paid'))
  const xeroStatus = str(row.status || pick(payload, 'Status', 'status'))
  const status = invoiceStatus(xeroStatus, amountDue, dueDate)
  const overdue = status === 'paid' ? 0 : daysOverdue(dueDate, calendarToday())
  const paidDate = dateOnly(pick(payload, 'FullyPaidOnDate', 'fully_paid_on_date')) || undefined
  const contactId = str(pick(contact, 'ContactID', 'contact_id') || pick(payload, 'ContactID', 'contact_id'))
  const customerName = str(pick(contact, 'Name', 'name') || 'Customer')

  return {
    id: str(row.id || pick(payload, 'InvoiceID', 'invoice_id') || invoiceNumber),
    invoiceNumber,
    customerId: contactId,
    amount,
    subtotal: num(pick(payload, 'SubTotal', 'sub_total')) || amount,
    vat: num(pick(payload, 'TotalTax', 'total_tax')),
    amountPaid,
    amountDue,
    currency: 'GBP',
    invoiceDate,
    dueDate,
    paidDate,
    paymentTermsDays: invoiceDate && dueDate ? Math.max(0, daysBetween(invoiceDate, dueDate)) : 30,
    poReference: (pick(payload, 'Reference', 'reference') as string | null | undefined) ?? null,
    status,
    riskLevel: riskFromOverdue(overdue, status),
    aiStatus: status === 'paid' ? 'resolved' : 'monitoring',
    lastAction: {
      label: status === 'paid' ? 'Paid in Xero' : 'Synced from Xero',
      at: dateOnly(row.updated_at) || calendarToday(),
    },
    lines: linesFromPayload(payload),
    customerName,
    daysOverdue: overdue,
  }
}

export function mapXeroContactToCustomer(contact: XeroContact, invoices: InvoiceRow[] = []): Customer {
  const related = invoices.filter((inv) => inv.customerId === contact.contact_id || inv.customerName === contact.name)
  const overdue = related.filter((inv) => inv.status === 'overdue' || inv.status === 'disputed')
  const year = contact.updated_date_utc ? Number(String(contact.updated_date_utc).slice(0, 4)) : new Date().getFullYear()
  const city = xeroCity(contact.addresses)
  const street = contact.addresses?.find((a) => a.address_type === 'STREET') ?? contact.addresses?.[0]
  return {
    id: contact.contact_id,
    name: contact.name,
    legalName: contact.name,
    companyNumber: contact.company_number ?? '',
    vatNumber: contact.tax_number ?? '',
    industry: 'Xero contact',
    customerSince: Number.isFinite(year) ? year : new Date().getFullYear(),
    contactName: xeroContactName(contact) || contact.name,
    contactEmail: contact.contact_persons?.find((p) => p.email_address)?.email_address || contact.email_address || '',
    accountsEmail: contact.email_address || '',
    phone: xeroPhone(contact.phones),
    website: contact.website ?? '',
    address: {
      line1: street?.address_line1 ?? '',
      line2: street?.address_line2 ?? undefined,
      city: street?.city || city || '',
      region: street?.region ?? undefined,
      postcode: street?.postal_code ?? '',
      country: street?.country ?? 'United Kingdom',
    },
    paymentTermsDays: 30,
    requiresPo: false,
    poOnFile: null,
    averagePaymentDelayDays: related.length ? Math.round(related.reduce((s, i) => s + i.daysOverdue, 0) / related.length) : 0,
    lifetimeInvoiceCount: related.length,
    disputesCount: related.filter((i) => i.status === 'disputed').length,
    riskLevel: overdue.some((i) => i.riskLevel === 'high') ? 'high' : overdue.length ? 'medium' : 'low',
    lastPaymentDate: related.find((i) => i.paidDate)?.paidDate ?? null,
  }
}
