import type { CollectionPoint, LateReasonStat, MonthlyMetric } from '@/types'

export const monthlyCollections: CollectionPoint[] = []
export const dailyCollections: Array<{ date: string; collected: number; overdue: number }> = []
export const monthlyMetrics: MonthlyMetric[] = []
export const previousMonth = { recovered: 0, averageDaysOverdue: 0 }
export const lateReasons: LateReasonStat[] = []
