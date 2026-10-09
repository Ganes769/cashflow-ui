import type { AgentAction, AgentDailyStats, AgentEvent, AgentRun } from '@/types'

export const agentDailyStats: AgentDailyStats = {
  runsToday: 0,
  successful: 0,
  waiting: 0,
  failed: 0,
  automatedActions: 0,
}

export const agentRuns: AgentRun[] = []
export const agentActions: AgentAction[] = []
export const agentEvents: AgentEvent[] = []
