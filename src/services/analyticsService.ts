import type { CollectionPoint, CollectionRange, LateReason, LateReasonStat, MonthlyMetric, OverviewSummary, RiskBucket } from '@/types'
import { calendarToday, daysOverdue } from '@/lib/dates'
import { db } from './mockDb'
import { getInvoices, isOverdue, isUnpaid } from './invoiceService'

const round1 = (n: number) => Math.round(n * 10) / 10

function previousMonthKey(month: string) {
  const [year, m] = month.split('-').map(Number)
  if (!year || !m) return month
  return m === 1 ? `${year - 1}-12` : `${year}-${String(m - 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [year, m] = key.split('-').map(Number)
  if (!year || !m) return key
  return new Date(year, m - 1, 1).toLocaleString('en-GB', { month: 'short' })
}

export async function getOverview(): Promise<OverviewSummary> {
  const invoices = await getInvoices()
  const unpaid = invoices.filter(isUnpaid)
  const overdue = unpaid.filter(isOverdue)
  const month = calendarToday().slice(0, 7)
  const lastMonth = previousMonthKey(month)
  const recovered = invoices.filter((i) => i.paidDate?.startsWith(month)).reduce((sum, i) => sum + i.amount, 0)
  const recoveredLast = invoices.filter((i) => i.paidDate?.startsWith(lastMonth)).reduce((sum, i) => sum + i.amount, 0)
  const avgDays = overdue.length ? overdue.reduce((sum, i) => sum + daysOverdue(i.dueDate, calendarToday()), 0) / overdue.length : 0
  const pending = db.approvals.filter((a) => a.status === 'pending')
  const outstanding = unpaid.reduce((sum, i) => sum + i.amountDue, 0)

  return {
    outstanding,
    unpaidCount: unpaid.length,
    overdue: overdue.reduce((sum, i) => sum + i.amountDue, 0),
    overdueCount: overdue.length,
    recoveredThisMonth: recovered,
    recoveredChangePct: recoveredLast === 0 ? 0 : round1(((recovered - recoveredLast) / recoveredLast) * 100),
    averageDaysOverdue: round1(avgDays),
    averageDaysOverdueChange: 0,
    aiActions: db.agentStats.runsToday,
    aiActionsAutomatic: db.agentStats.automatedActions,
    pendingApprovals: pending.length,
    highPriorityApprovals: pending.filter((a) => a.priority === 'high').length,
  }
}

export async function getCollections(range: CollectionRange): Promise<CollectionPoint[]> {
  const invoices = await getInvoices()
  const outstanding = invoices.filter(isUnpaid).reduce((s, i) => s + i.amountDue, 0)
  const overdue = invoices.filter(isOverdue).reduce((s, i) => s + i.amountDue, 0)
  const collected = invoices.filter((i) => i.paidDate).reduce((s, i) => s + i.amount, 0)
  const label = range === '6m' ? 'Synced' : range.toUpperCase()
  return [{ label, collected, overdue: overdue || outstanding }]
}

export async function getRiskDistribution(): Promise<RiskBucket[]> {
  const invoices = await getInvoices()
  const watched = invoices.filter((i) => isOverdue(i) || i.status === 'due_soon')
  const bucket = (key: RiskBucket['key'], label: string, match: (i: (typeof watched)[number]) => boolean): RiskBucket => {
    const items = watched.filter(match)
    return { key, label, count: items.length, amount: items.reduce((s, i) => s + i.amountDue, 0) }
  }
  return [
    bucket('low', 'Low risk', (i) => i.status !== 'disputed' && i.riskLevel === 'low'),
    bucket('medium', 'Medium risk', (i) => i.status !== 'disputed' && i.riskLevel === 'medium'),
    bucket('high', 'High risk', (i) => i.status !== 'disputed' && i.riskLevel === 'high'),
    bucket('disputed', 'Disputed', (i) => i.status === 'disputed'),
  ]
}

export async function getAnalytics(): Promise<{ monthly: MonthlyMetric[]; lateReasons: LateReasonStat[] }> {
  const invoices = await getInvoices()
  const today = calendarToday().slice(0, 7)
  const keys: string[] = []
  let cursor = today
  for (let i = 0; i < 6; i += 1) {
    keys.unshift(cursor)
    cursor = previousMonthKey(cursor)
  }

  const monthly: MonthlyMetric[] = keys.map((key) => {
    const paid = invoices.filter((i) => i.paidDate?.startsWith(key))
    const recovered = paid.reduce((sum, i) => sum + i.amount, 0)
    const issued = invoices.filter((i) => i.invoiceDate.startsWith(key))
    const issuedTotal = issued.reduce((sum, i) => sum + i.amount, 0)
    const days = paid.map((i) => (i.paidDate ? daysOverdue(i.dueDate, i.paidDate) : 0))
    const avg = days.length ? days.reduce((sum, d) => sum + d, 0) / days.length : 0
    return {
      month: monthLabel(key),
      recoveryRate: issuedTotal ? round1((recovered / issuedTotal) * 100) : 0,
      avgCollectionDays: round1(Math.max(0, avg)),
      automationRate: 0,
      humanInterventionRate: 0,
      recovered,
    }
  })

  const reasonCounts = new Map<LateReason, number>()
  for (const investigation of db.investigations) {
    if (!investigation.likelyReason) continue
    reasonCounts.set(investigation.likelyReason, (reasonCounts.get(investigation.likelyReason) ?? 0) + 1)
  }
  const lateReasons: LateReasonStat[] = [...reasonCounts.entries()].map(([reason, count]) => ({ reason, count }))

  return { monthly, lateReasons }
}
