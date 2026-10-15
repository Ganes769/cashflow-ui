import { useEffect, useState } from 'react'
import { Loader2, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { sendInvestigationEmail } from '@/api/email'
import type { InvestigationEmailDraft } from '@/lib/investigationEmail'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function InvestigationEmailCard({ draft }: { draft: InvestigationEmailDraft }) {
  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.body)
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  useEffect(() => {
    setSubject(draft.subject)
    setBody(draft.body)
    setSentTo(null)
  }, [draft])

  const missingTo = !draft.to
  const canClick =
    draft.can_send &&
    !sending &&
    !sentTo &&
    Boolean(draft.invoice_number?.trim()) &&
    Boolean(subject.trim()) &&
    Boolean(body.trim())

  const onSend = async () => {
    if (!canClick || !draft.invoice_number) return
    setSending(true)
    try {
      const result = await sendInvestigationEmail({
        invoice_number: draft.invoice_number,
        subject: subject.trim(),
        body: body.trim(),
      })
      setSentTo(result.to)
      toast.success(`Email sent to ${result.to}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send email.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 bg-primary px-5 py-2.5 text-primary-foreground">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <Mail className="size-3.5" aria-hidden /> Collection email
        </p>
        <span className="text-[11px] text-primary-foreground/70">Recipient comes from Xero</span>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="investigate-email-to">To</Label>
          <Input
            id="investigate-email-to"
            readOnly
            value={missingTo ? 'No contact email in Xero' : draft.to!}
            className={missingTo ? 'text-muted-foreground' : undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="investigate-email-subject">Subject</Label>
          <Input
            id="investigate-email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={Boolean(sentTo)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="investigate-email-body">Body</Label>
          <Textarea
            id="investigate-email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={Boolean(sentTo)}
            className="min-h-48 whitespace-pre-wrap font-sans text-[13px] leading-relaxed"
          />
        </div>
        {sentTo ? (
          <p className="text-[13px] font-medium text-lime-strong">Email sent to {sentTo}</p>
        ) : null}
        {draft.can_send ? (
          <Button size="lg" onClick={() => void onSend()} disabled={!canClick}>
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
            {sending ? 'Sending…' : sentTo ? 'Sent' : 'Send email'}
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
