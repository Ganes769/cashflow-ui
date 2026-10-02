import type { AIStatus, AgentStage, AgentTool, FollowUpStatus, InvoiceStatus, LateReason, RiskLevel } from '@/types'

type Tone = 'lime' | 'sun' | 'peach' | 'coral' | 'muted' | 'outline' | 'default'

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  current: { label: 'Current', tone: 'muted' },
  due_soon: { label: 'Due soon', tone: 'sun' },
  overdue: { label: 'Overdue', tone: 'peach' },
  disputed: { label: 'Disputed', tone: 'coral' },
  paid: { label: 'Paid', tone: 'lime' },
}

export const AI_STATUS: Record<AIStatus, { label: string; tone: Tone }> = {
  not_started: { label: 'Not started', tone: 'muted' },
  monitoring: { label: 'Monitoring', tone: 'outline' },
  investigating: { label: 'Investigating', tone: 'sun' },
  needs_review: { label: 'Needs review', tone: 'coral' },
  awaiting_approval: { label: 'Awaiting approval', tone: 'peach' },
  action_executed: { label: 'Action executed', tone: 'lime' },
  resolved: { label: 'Resolved', tone: 'lime' },
}

export const RISK: Record<RiskLevel, { label: string; tone: Tone; dot: string }> = {
  low: { label: 'Low', tone: 'lime', dot: 'bg-lime' },
  medium: { label: 'Medium', tone: 'sun', dot: 'bg-sun' },
  high: { label: 'High', tone: 'peach', dot: 'bg-peach' },
}

export const LATE_REASON: Record<LateReason, string> = {
  missing_po: 'Missing PO',
  customer_dispute: 'Customer dispute',
  incorrect_invoice: 'Incorrect invoice',
  approval_delay: 'Approval delay',
  cash_flow_issue: 'Customer cash-flow issue',
  contact_issue: 'Contact issue',
  unknown: 'Unknown',
}

export const FOLLOW_UP_STATUS: Record<FollowUpStatus, { label: string; tone: Tone }> = {
  scheduled: { label: 'Scheduled', tone: 'lime' },
  waiting: { label: 'Waiting', tone: 'sun' },
  completed: { label: 'Completed', tone: 'muted' },
  cancelled: { label: 'Cancelled', tone: 'outline' },
}

export const AGENT_STAGES: Array<{ key: AgentStage; label: string }> = [
  { key: 'triage', label: 'Triage' },
  { key: 'collect_evidence', label: 'Collect evidence' },
  { key: 'investigate', label: 'Investigate' },
  { key: 'plan_action', label: 'Plan action' },
  { key: 'human_approval', label: 'Human approval' },
  { key: 'execute', label: 'Execute' },
  { key: 'verify_payment', label: 'Verify payment' },
]

export const TOOL_DESCRIPTION: Record<AgentTool, string> = {
  get_invoice: 'Read invoice from accounting system',
  get_customer: 'Read customer record and terms',
  get_payment_history: 'Read historic payments',
  search_customer_emails: 'Search customer email threads',
  get_contract: 'Read contract and payment terms',
  compare_invoices: 'Compare with previous invoices',
  draft_action: 'Draft recommended action',
}
