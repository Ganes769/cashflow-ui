import type { AuditLogEntry, Integration, Notification, TeamMember } from '@/types'

export const company = {
  name: 'Your organisation',
  companyNumber: '',
  vatNumber: '',
  address: '',
  baseCurrency: 'GBP',
  financialYearEnd: '',
}

export const currentUser: TeamMember = {
  id: 'usr_1',
  name: 'Ganesh Nawali',
  email: 'ganesh@brightline.co.uk',
  role: 'Finance Manager',
}

export const team: TeamMember[] = [currentUser]

export const integrations: Integration[] = [
  {
    id: 'xero',
    name: 'Xero',
    description: 'Invoices, contacts and payments',
    status: 'not_connected',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Customer email history for investigations',
    status: 'not_connected',
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Alternative accounting source',
    status: 'not_connected',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Alternative accounting source',
    status: 'not_connected',
  },
]

export const aiSettings = {
  autoSendLowRiskReminders: true,
  requireApprovalForReissue: true,
  requireApprovalAbove: 5_000,
  minimumConfidence: 70,
  pauseRemindersOnDispute: true,
}

export const notificationSettings = {
  approvalRequests: true,
  highRiskFindings: true,
  paymentsReceived: true,
  dailyDigest: false,
}

export const auditLog: AuditLogEntry[] = []
export const notifications: Notification[] = []
