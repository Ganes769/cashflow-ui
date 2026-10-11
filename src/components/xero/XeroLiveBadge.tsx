import { AlertTriangle, RefreshCw } from 'lucide-react'
import { isXeroConnected } from '@/api/auth'
import { useAuth } from '@/auth/AuthProvider'
import { useXeroStatus, useXeroSync } from '@/hooks/useXero'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function XeroLiveBadge({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { data } = useXeroStatus()
  const live = isXeroConnected(data)
  const finished = data?.last_sync?.finished_at

  return (
    <span className={cn('inline-flex items-center gap-2 text-[12px]', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold neo-raised-sm',
          live ? 'bg-lime-soft text-lime-strong' : 'bg-card text-muted-foreground',
        )}
      >
        <span className={cn('size-1.5 rounded-full', live ? 'bg-lime-strong' : 'bg-muted-foreground')} aria-hidden />
        {live ? 'Live' : 'Offline'}
      </span>
      {!compact && finished ? <span className="hidden text-muted-foreground sm:inline">Last synced {formatDateTime(finished)}</span> : null}
    </span>
  )
}

export function XeroSyncErrorBanner({ className }: { className?: string }) {
  const { data } = useXeroStatus()
  const { login, connecting } = useAuth()
  const last = data?.last_sync
  if (!last?.error) return null

  return (
    <Card className={cn('flex flex-col gap-3 border-coral/40 bg-coral-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="flex gap-2 text-[13px] text-coral">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold">Last sync failed.</span> {last.error}
        </span>
      </p>
      <Button size="sm" variant="outline" disabled={connecting} onClick={() => void login()}>
        {connecting ? 'Redirecting…' : 'Reconnect Xero'}
      </Button>
    </Card>
  )
}

export function SyncNowButton({ className }: { className?: string }) {
  const sync = useXeroSync()
  const { data } = useXeroStatus()
  const live = isXeroConnected(data)

  return (
    <Button
      size="sm"
      variant="outline"
      className={className}
      disabled={!live || sync.isPending}
      onClick={() => sync.mutate()}
    >
      <RefreshCw className={cn(sync.isPending && 'animate-spin')} aria-hidden />
      {sync.isPending ? 'Syncing…' : 'Sync now'}
    </Button>
  )
}
