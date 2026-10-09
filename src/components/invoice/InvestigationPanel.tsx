import type { LucideIcon } from 'lucide-react'
import { Check, Database, FileText, History, Loader2, Mail, Play, Receipt, RotateCw, ScanSearch } from 'lucide-react'
import type { AgentTool, EvidenceSource, Investigation } from '@/types'
import type { StreamInvestigationStep } from '@/hooks/useInvestigateStream'
import { LATE_REASON, TOOL_DESCRIPTION } from '@/lib/labels'
import { formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AiLabel, ConfidenceMeter } from '@/components/shared/ai'
import { EmptyState } from '@/components/shared/states'

const SOURCE: Record<EvidenceSource, { icon: LucideIcon; label: string }> = {
  contract: { icon: FileText, label: 'Contract' },
  invoice: { icon: Receipt, label: 'Invoice' },
  email: { icon: Mail, label: 'Email' },
  payment_history: { icon: History, label: 'Payment history' },
  accounting: { icon: Database, label: 'Accounting' },
}

function toolLabel(tool: string) {
  return TOOL_DESCRIPTION[tool as AgentTool] ?? tool.replace(/_/g, ' ')
}

interface LegacyInvestigationPanelProps {
  mode?: 'legacy'
  investigation: Investigation | null
  onStart: () => void
  starting: boolean
}

interface StreamInvestigationPanelProps {
  mode: 'stream'
  steps: StreamInvestigationStep[]
  result: string | null
  error: string | null
  investigating: boolean
  onInvestigate: () => void
}

export type InvestigationPanelProps = LegacyInvestigationPanelProps | StreamInvestigationPanelProps

function StreamStepList({ steps }: { steps: StreamInvestigationStep[] }) {
  if (steps.length === 0) return null
  return (
    <ol aria-label="Investigation tool calls">
      {steps.map((step, i) => (
        <li key={step.key} className="relative flex gap-3 pb-3 last:pb-0">
          {i < steps.length - 1 && (
            <span className={cn('absolute bottom-0 left-[11px] top-6 w-px', step.status === 'completed' ? 'bg-lime' : 'bg-border')} aria-hidden />
          )}
          <span
            className={cn(
              'z-[1] flex size-6 shrink-0 items-center justify-center rounded-full',
              step.status === 'completed' && 'bg-lime text-white',
              step.status === 'running' && 'bg-sun-soft text-sun-strong ring-1 ring-sun',
            )}
          >
            {step.status === 'completed' && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
            {step.status === 'running' && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[13px] font-medium">{toolLabel(step.tool)}</p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {step.tool}() · step {step.step}
              <span className="sr-only"> — {step.status === 'completed' ? 'completed' : 'running'}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function StreamInvestigationPanel({ steps, result, error, investigating, onInvestigate }: StreamInvestigationPanelProps) {
  const hasActivity = investigating || steps.length > 0 || result || error
  const idle = !hasActivity

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI investigation</CardTitle>
        <CardDescription>
          {idle
            ? 'Run the agent against this invoice. Tool calls stream live from the API.'
            : investigating
              ? `${steps.filter((s) => s.status === 'completed').length} tool call${steps.filter((s) => s.status === 'completed').length === 1 ? '' : 's'} complete`
              : error
                ? 'Investigation could not be completed'
                : 'Investigation finished'}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={onInvestigate} disabled={investigating}>
            {investigating ? <Loader2 className="animate-spin" /> : idle ? <Play /> : <RotateCw />}
            {investigating ? 'Investigating…' : idle ? 'Investigate' : 'Investigate again'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        {idle && (
          <EmptyState
            icon={ScanSearch}
            title="No investigation yet"
            description="The agent will call tools such as get_invoice and get_customer, then return a written finding for this invoice."
            action={
              <Button onClick={onInvestigate} disabled={investigating}>
                <ScanSearch /> Investigate
              </Button>
            }
          />
        )}

        {investigating && (
          <div role="status" aria-live="polite" className="flex items-center gap-2.5 rounded-lg border border-sun bg-sun-soft px-3 py-2 text-[13px]">
            <Loader2 className="size-4 animate-spin text-sun-strong" aria-hidden />
            <span className="font-medium">Investigating this invoice…</span>
            <span className="truncate text-foreground/70">Streaming from the agent</span>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-xl border border-coral/40 bg-coral-soft/50 px-4 py-3 text-[13px] text-coral">
            <p className="font-semibold">Investigation failed</p>
            <p className="mt-1 text-foreground/80">{error}</p>
          </div>
        )}

        {!idle && <StreamStepList steps={steps} />}

        {result && (
          <section aria-label="Investigation result" className="rounded-xl border bg-card p-4 neo-inset-sm">
            <AiLabel>Agent response</AiLabel>
            <div className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed">{result}</div>
          </section>
        )}
      </CardContent>
    </Card>
  )
}

function LegacyInvestigationPanel({ investigation, onStart, starting }: LegacyInvestigationPanelProps) {
  if (!investigation) {
    return (
      <Card>
        <EmptyState
          icon={ScanSearch}
          title="No AI investigation yet"
          description="The agent will read the invoice, customer record, payment history and emails, then suggest a next step for you to approve."
          action={
            <Button onClick={onStart} disabled={starting}>
              {starting ? <Loader2 className="animate-spin" /> : <Play />} Start investigation
            </Button>
          }
        />
      </Card>
    )
  }

  const running = investigation.state !== 'completed'
  const done = investigation.steps.filter((s) => s.status === 'done').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI investigation</CardTitle>
        <CardDescription>
          Started {formatTime(investigation.startedAt)} · {done}/{investigation.steps.length} checks complete
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={onStart} disabled={running || starting}>
            {running ? <Loader2 className="animate-spin" /> : <RotateCw />}
            {running ? 'Running' : 'Re-run'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        {running && (
          <div role="status" aria-live="polite" className="flex items-center gap-2.5 rounded-lg border border-sun bg-sun-soft px-3 py-2 text-[13px]">
            <Loader2 className="size-4 animate-spin text-sun-strong" aria-hidden />
            <span className="font-medium">Agent is investigating…</span>
            <span className="truncate text-foreground/70">{investigation.currentStep}</span>
          </div>
        )}

        <ol aria-label="Investigation steps">
          {investigation.steps.map((step, i) => (
            <li key={step.id} className="relative flex gap-3 pb-3 last:pb-0">
              {i < investigation.steps.length - 1 && (
                <span className={cn('absolute bottom-0 left-[11px] top-6 w-px', step.status === 'done' ? 'bg-lime' : 'bg-border')} aria-hidden />
              )}
              <span
                className={cn(
                  'z-[1] flex size-6 shrink-0 items-center justify-center rounded-full',
                  step.status === 'done' && 'bg-lime text-white',
                  step.status === 'running' && 'bg-sun-soft text-sun-strong ring-1 ring-sun',
                  step.status === 'pending' && 'border border-dashed border-border bg-card',
                )}
              >
                {step.status === 'done' && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                {step.status === 'running' && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={cn('text-[13px]', step.status === 'pending' ? 'text-muted-foreground' : 'font-medium')}>
                  {step.label}
                  <span className="sr-only"> — {step.status}</span>
                </p>
                {step.tool && <p className="font-mono text-[11px] text-muted-foreground">{step.tool}()</p>}
              </div>
            </li>
          ))}
        </ol>

        {investigation.finding && investigation.confidence !== null && (
          <section aria-label="AI finding" className="rounded-xl border border-sun bg-sun-soft/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <AiLabel>AI finding · hypothesis</AiLabel>
              <ConfidenceMeter value={investigation.confidence} />
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed">{investigation.finding}</p>
            <p className="mt-2 text-xs text-foreground/65">
              AI-identified likely reason: <span className="font-semibold text-foreground">{LATE_REASON[investigation.likelyReason]}</span> · not yet confirmed by the customer
            </p>
          </section>
        )}

        {investigation.evidence.length > 0 && (
          <section aria-label="Evidence">
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Evidence from records ({investigation.evidence.length})</h4>
            <ul className="grid gap-2 sm:grid-cols-2">
              {investigation.evidence.map((ev) => {
                const source = SOURCE[ev.source]
                const Icon = source.icon
                return (
                  <li key={ev.id} className="rounded-lg border bg-card p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <Icon className="size-3.5" aria-hidden /> {source.label} · {ev.sourceRef}
                    </p>
                    <p className="mt-1.5 text-[13px] font-medium">{ev.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{ev.detail}</p>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  )
}

export function InvestigationPanel(props: InvestigationPanelProps) {
  if (props.mode === 'stream') return <StreamInvestigationPanel {...props} />
  return <LegacyInvestigationPanel {...props} />
}
