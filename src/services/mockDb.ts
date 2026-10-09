import type {
  AgentAction,
  AgentDailyStats,
  AgentEvent,
  AgentRun,
  Approval,
  AuditLogEntry,
  Communication,
  Customer,
  FollowUp,
  Investigation,
  Invoice,
  Notification,
  Payment,
} from "@/types";

/**
 * Session-only store for approvals, investigations and follow-ups created on this desk.
 * Receivables themselves come from synced Xero — this is not a seed database.
 */
export const db = {
  invoices: [] as Invoice[],
  customers: [] as Customer[],
  payments: [] as Payment[],
  communications: [] as Communication[],
  investigations: [] as Investigation[],
  approvals: [] as Approval[],
  followUps: [] as FollowUp[],
  agentRuns: [] as AgentRun[],
  agentActions: [] as AgentAction[],
  agentEvents: [] as AgentEvent[],
  agentStats: {
    runsToday: 0,
    successful: 0,
    waiting: 0,
    failed: 0,
    automatedActions: 0,
  } satisfies AgentDailyStats,
  auditLog: [] as AuditLogEntry[],
  notifications: [] as Notification[],
};

let sequence = 0;
export function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}_${Date.now().toString(36)}${sequence}`;
}

/** Simulated network latency so loading states are exercised. */
export function latency(ms = 250): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms + Math.random() * 150),
  );
}

export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} ${id} was not found`);
    this.name = "NotFoundError";
  }
}
