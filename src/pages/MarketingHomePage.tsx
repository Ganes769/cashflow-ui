import { type ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileSearch,
  FileText,
  Link2,
  Lock,
  Mail,
  Menu,
  Scale,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Timer,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react'
import { APP, LOGIN } from '@/lib/paths'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/Sidebar'
import { useAuth } from '@/auth/AuthProvider'
import { Reveal, useCycle, usePrefersReducedMotion } from '@/components/shared/motion'

const NAV = [
  { href: '#product', label: 'Product' },
  { href: '#how', label: 'How it works' },
  { href: '#control', label: 'Control' },
  { href: '#faq', label: 'FAQ' },
]

function MeshBackdrop() {
  const reduced = usePrefersReducedMotion()
  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 bottom-0 overflow-hidden" aria-hidden>
      <div className={cn('absolute -left-24 top-32 size-[22rem] rounded-full bg-lime/15 blur-3xl', !reduced && 'marketing-orb')} />
      <div
        className={cn('absolute -right-28 top-[32rem] size-[18rem] rounded-full bg-primary/10 blur-3xl', !reduced && 'marketing-orb')}
        style={reduced ? undefined : { animationDelay: '-4s' }}
      />
    </div>
  )
}

function ProductNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 isolate bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            'mt-3 flex h-14 items-center gap-4 overflow-hidden rounded-2xl bg-card pl-4 pr-2 neo-raised-sm sm:gap-6 sm:pl-5 sm:pr-2.5',
            scrolled || open ? 'neo-convex' : '',
          )}
        >
          <Logo to="/" />
          <nav className="hidden min-w-0 items-center gap-6 text-[13.5px] font-medium text-muted-foreground md:flex" aria-label="Product">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <Button asChild>
                <Link to={APP}>
                  Open desk <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <a href="#how">How it works</a>
                </Button>
                <Button asChild className="relative z-10">
                  <Link to={LOGIN}>Log in</Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
              {open ? <X /> : <Menu />}
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            </Button>
          </div>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="mx-auto mt-2 max-w-6xl px-4 sm:px-6 md:hidden" aria-label="Product">
          <div className="rounded-2xl bg-card px-4 py-3 neo-inset-sm">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="block rounded-lg px-2 py-2.5 text-[14px] font-medium hover:bg-accent" onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

const DESK_FEED = [
  { step: '01', text: 'Read invoices and contacts from Xero' },
  { step: '02', text: 'Investigate why an invoice is still unpaid' },
  { step: '03', text: 'Draft the next action and wait for you' },
  { step: '04', text: 'Follow up until payment lands' },
]

function HeroMock() {
  const reduced = usePrefersReducedMotion()
  const { item: feed, index } = useCycle(DESK_FEED, 2800)
  const bars = [
    { h: 42, fill: 'bg-lime' },
    { h: 58, fill: 'bg-peach' },
    { h: 48, fill: 'bg-lime' },
    { h: 72, fill: 'bg-peach' },
    { h: 64, fill: 'bg-lime' },
    { h: 86, fill: 'bg-peach' },
  ]
  return (
    <div className={cn('relative', !reduced && 'marketing-float')}>
      <div className="relative overflow-hidden rounded-3xl bg-card neo-raised">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex gap-1" aria-hidden>
              <span className="size-1.5 rounded-full bg-coral/80" />
              <span className="size-1.5 rounded-full bg-sun/90" />
              <span className="size-1.5 rounded-full bg-lime" />
            </span>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Collections desk · your Xero book</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-2 py-0.5 text-[11px] font-semibold text-sun-strong neo-raised-sm">
            <span className={cn('size-1.5 rounded-full bg-sun', !reduced && 'marketing-pulse')} aria-hidden />
            Agent watching
          </span>
        </div>
        <div className="relative">
          {!reduced && <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-lime/20 to-transparent ui-scan" aria-hidden />}
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {[
              { label: 'Outstanding', tone: '' },
              { label: 'Overdue', tone: 'text-peach-strong' },
              { label: 'Recovered this month', tone: 'text-lime-strong' },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl bg-card px-3 py-2.5 neo-inset-sm">
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                <p className={cn('mt-0.5 text-lg font-semibold tabular', kpi.tone)}>—</p>
              </div>
            ))}
          </div>
          <div className="flex h-28 items-end gap-2 px-5 pb-4" aria-hidden>
            {bars.map((bar, i) => (
              <span
                key={i}
                className={cn('w-full rounded-t-md', bar.fill, !reduced && 'marketing-bar')}
                style={{ height: `${bar.h}%`, animationDelay: reduced ? undefined : `${180 + i * 70}ms` }}
              />
            ))}
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">How the desk works</p>
          <div className="mt-2 min-h-[2.6rem]" aria-live="polite">
            <p key={index} className={cn('flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-2 text-[13px] neo-inset-sm', !reduced && 'ui-swap')}>
              <span className="truncate">
                <span className="mr-2 font-mono text-[11px] text-muted-foreground">{feed.step}</span>
                {feed.text}
              </span>
              <span className={cn('size-1.5 shrink-0 rounded-full bg-lime-strong', !reduced && 'marketing-pulse')} aria-hidden />
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-peach-soft/70 px-3 py-2.5 neo-inset-sm">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">Human approval before any send</p>
              <p className="truncate text-xs text-muted-foreground">AI drafts the next step. You decide whether it goes out.</p>
            </div>
            <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">Approve</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  { icon: FileSearch, title: 'Read the books', body: 'Connect Xero once. The agent pulls contacts from your organisation and reads invoices, payments and history — nothing is guessed from thin air.' },
  { icon: Sparkles, title: 'Investigate the delay', body: 'It searches emails, contracts and previous invoices, then writes a finding labelled as a hypothesis — never as fact.' },
  { icon: UserCheck, title: 'You decide', body: 'Every customer-facing action waits in the Approval Centre. Edit the draft, approve it, or reject it.' },
  { icon: Mail, title: 'Act, then watch', body: 'Once you approve, the follow-up is scheduled and payment is tracked until the invoice is actually paid.' },
]

const PROBLEMS = [
  { icon: Timer, title: 'Late invoices sit unnoticed', body: 'Credit controllers chase the loudest customer, not the one most likely to pay this week.' },
  { icon: Wallet, title: 'Cash is trapped in AR', body: 'UK SMEs typically have tens of thousands outstanding. Most of it is recoverable with the right next step.' },
  { icon: Lock, title: 'AI that emails customers is dangerous', body: 'A wrong reminder on a disputed invoice burns the relationship. CashFlow OS never sends without you.' },
]

const CAPABILITIES = [
  { icon: Link2, title: 'Xero as the source of truth', body: 'Contacts, invoices and ageing come from your organisation. The desk does not invent balances.' },
  { icon: ScanSearch, title: 'Evidence-backed findings', body: 'Missing POs, disputes and payment patterns sit in their own cards, separate from the conclusion.' },
  { icon: ClipboardCheck, title: 'Approval before send', body: 'Draft the email, re-issue the invoice, or pause. Nothing reaches a customer until a person clicks Approve.' },
  { icon: CalendarClock, title: 'Follow-up until paid', body: 'Approved actions are scheduled and watched. The desk checks whether the money actually landed.' },
  { icon: Scale, title: 'Disputes stay with a person', body: 'Policy pauses automated reminders the moment a dispute is found. A human owns the conversation.' },
  { icon: FileText, title: 'Correct the invoice, not the customer', body: 'If the books are wrong, the agent drafts a corrected invoice instead of sending another chase.' },
]

const COMPARE = [
  { label: 'Source of truth', typical: 'A spreadsheet, or last week’s export', ours: 'Live Xero invoices and contacts' },
  { label: 'First action', typical: 'Send another reminder', ours: 'Find why it has not been paid' },
  { label: 'Customer email', typical: 'Often automatic', ours: 'Never without your approval' },
  { label: 'Disputes', typical: 'Still chased', ours: 'Paused for a person to handle' },
  { label: 'AI language', typical: 'Presented as fact', ours: 'Labelled as a hypothesis' },
]

const GUARANTEES = [
  'Log in with email or continue with Xero.',
  'Live contacts load after you connect Xero. Nothing is sent without you.',
  'AI findings are labelled as hypotheses.',
  'Human approval is required before any customer contact.',
]

const FAQ = [
  {
    q: 'Does the agent email customers on its own?',
    a: 'No. Every outbound action waits in the Approval Centre. You can edit the draft, approve it, or reject it. Low-risk reminders can be set to auto-send only if you turn that policy on.',
  },
  {
    q: 'Do I have to connect Xero to try the desk?',
    a: 'Log in, then connect Xero. Contacts and invoices load from your organisation — the desk does not use sample books.',
  },
  {
    q: 'What happens if an invoice is disputed?',
    a: 'Automated reminders pause. The agent gathers the evidence and asks a person to take over. It will not keep chasing a customer who has already raised a problem.',
  },
  {
    q: 'Is this a replacement for credit control?',
    a: 'No. It is an investigations desk for finance managers. The agent does the tedious reading; you stay the manager of every customer conversation.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-semibold tracking-[-0.01em]"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-300', open && 'rotate-180')} aria-hidden />
      </button>
      <div className={cn('grid transition-[grid-template-rows,opacity] duration-300', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <p className="overflow-hidden pb-4 text-[13.5px] leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </div>
  )
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>
}

export function MarketingHomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <MeshBackdrop />
      <div className="relative">
        <ProductNav />

        <main>
          <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div>
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-[12px] font-medium neo-raised-sm">
                  <Sparkles className="size-3.5 text-lime-strong" aria-hidden />
                  AI accounts receivable for UK SMEs
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="font-display mt-5 max-w-xl text-[2.45rem] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-5xl">
                  Get paid faster. <span className="text-muted-foreground">Never let an agent talk to a customer without you.</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                  CashFlow OS watches overdue invoices, finds the likely reason they haven’t been paid, and drafts the next action. You approve it. Then it follows up until the money lands.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link to={isAuthenticated ? APP : LOGIN}>
                      {isAuthenticated ? 'Open the collections desk' : 'Log in'} <ArrowRight />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="#how">See how it works</a>
                  </Button>
                </div>
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  {['Human approval on every send', 'Xero as the books', 'Findings labelled as hypotheses'].map((item) => (
                    <li key={item} className="inline-flex items-center gap-1.5">
                      <Check className="size-3.5 text-lime-strong" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={180}>
              <HeroMock />
            </Reveal>
          </section>

          <section>
            <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6">
              {[
                { k: 'Human first', v: 'every outbound action is approved' },
                { k: 'Xero ready', v: 'connect your organisation when you log in' },
                { k: 'UK SMEs', v: 'built for finance teams who live in the books' },
              ].map((stat, i) => (
                <Reveal key={stat.k} delay={i * 90}>
                  <div className="rounded-2xl bg-card px-5 py-5 neo-inset-sm">
                    <p className="font-display text-2xl font-semibold tracking-[-0.03em]">{stat.k}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{stat.v}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="product" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
            <Reveal>
              <SectionEyebrow>The problem</SectionEyebrow>
              <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em]">Chasing invoices is slow, awkward, and easy to get wrong.</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {PROBLEMS.map((item, i) => {
                const Icon = item.icon
                return (
                  <Reveal key={item.title} delay={i * 80}>
                    <article className="h-full rounded-2xl bg-card p-5 neo-raised">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-card neo-inset-sm">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <h3 className="mt-4 text-[15px] font-semibold">{item.title}</h3>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{item.body}</p>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </section>

          <section>
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
              <Reveal>
                <SectionEyebrow>The desk</SectionEyebrow>
                <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em]">Built like a collections office, not a chatbot.</h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                  Six things the agent actually does — each one leaves a trail you can inspect, edit, or stop.
                </p>
              </Reveal>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CAPABILITIES.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <Reveal key={item.title} delay={i * 70}>
                      <article className="h-full rounded-2xl bg-card p-5 neo-raised">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-lime-soft text-lime-strong neo-raised-sm">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <h3 className="mt-4 text-[15px] font-semibold">{item.title}</h3>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{item.body}</p>
                      </article>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          </section>

          <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
            <Reveal>
              <SectionEyebrow>What we do</SectionEyebrow>
              <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em]">An investigations desk, not a chatbot.</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                CashFlow OS is built for finance managers who already live in Xero. Connect the organisation, then let the agent do the tedious work: finding missing POs, spotting disputes, and drafting the email you would have written anyway.
              </p>
            </Reveal>
            <ol className="mt-12 grid gap-6 md:grid-cols-2">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <li key={step.title}>
                    <Reveal delay={i * 90}>
                      <div className="flex gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground neo-raised-sm">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Step {i + 1}</p>
                          <h3 className="mt-1 text-[15px] font-semibold">{step.title}</h3>
                          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{step.body}</p>
                        </div>
                      </div>
                    </Reveal>
                  </li>
                )
              })}
            </ol>
          </section>

          <section>
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
              <Reveal>
                <SectionEyebrow>Compared</SectionEyebrow>
                <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em]">A reminder tool chases. This desk investigates.</h2>
              </Reveal>
              <Reveal delay={80}>
                <div className="mt-10 overflow-hidden rounded-3xl bg-card neo-raised">
                  <table className="w-full text-left text-[13.5px]">
                    <thead className="border-b bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Work</th>
                        <th className="px-5 py-3 font-semibold">Typical reminder tool</th>
                        <th className="px-5 py-3 font-semibold">CashFlow OS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE.map((row) => (
                        <tr key={row.label} className="border-b last:border-b-0">
                          <th className="px-5 py-3.5 font-semibold text-foreground">{row.label}</th>
                          <td className="px-5 py-3.5 text-muted-foreground">{row.typical}</td>
                          <td className="px-5 py-3.5 font-medium">{row.ours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            </div>
          </section>

          <section id="control" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <Reveal>
                  <SectionEyebrow>Designed to be trusted</SectionEyebrow>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em]">The agent is a junior. You stay the manager.</h2>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                    Late-payment reasons are labelled “AI-identified likely reason”. Evidence sits in its own cards, separate from the conclusion. Nothing is sent until a person clicks Approve.
                  </p>
                </Reveal>
                <ul className="mt-8 space-y-3">
                  {GUARANTEES.map((item, i) => (
                    <li key={item}>
                      <Reveal delay={80 + i * 70}>
                        <span className="flex items-start gap-2.5 text-[13.5px]">
                          <Check className="mt-0.5 size-4 shrink-0 text-lime-strong" aria-hidden />
                          {item}
                        </span>
                      </Reveal>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ShieldCheck, label: 'Human gate' },
                    { icon: Building2, label: 'Xero organisation' },
                    { icon: Scale, label: 'UK SME books' },
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <Reveal key={item.label} delay={120 + i * 70}>
                        <p className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 text-[13px] font-medium neo-raised-sm">
                          <Icon className="size-4 text-lime-strong" aria-hidden />
                          {item.label}
                        </p>
                      </Reveal>
                    )
                  })}
                </div>
              </div>
              <Reveal delay={120}>
                <div className="rounded-3xl bg-card p-6 neo-raised">
                  <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ShieldCheck className="size-4" aria-hidden /> What you approve
                  </p>
                  <p className="mt-4 text-lg font-semibold tracking-[-0.02em]">A draft, not a send</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                    The agent reads your Xero invoices, hypothesises why one is unpaid, and writes the next step. It waits in the Approval Centre until you edit it, approve it, or reject it.
                  </p>
                  <Button className="mt-6" asChild>
                    <Link to={isAuthenticated ? APP : LOGIN}>
                      {isAuthenticated ? 'Open the collections desk' : 'Log in to connect Xero'} <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </section>

          <section id="faq">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <SectionEyebrow>FAQ</SectionEyebrow>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em]">Straight answers before you log in.</h2>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                  CashFlow OS is a collections desk with a junior agent. If a question is not here, open the desk and inspect an invoice yourself.
                </p>
              </Reveal>
              <Reveal delay={80}>
                <div className="rounded-3xl bg-card px-5 neo-raised">
                  {FAQ.map((item) => (
                    <FaqItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          <section className="px-4 pb-10 sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl bg-primary px-6 py-12 text-primary-foreground neo-convex sm:flex-row sm:items-center sm:px-10">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">{isAuthenticated ? 'Your collections desk is ready.' : 'Log in and open the collections desk.'}</h2>
                <p className="mt-2 max-w-md text-[14px] text-primary-foreground/70">
                  {isAuthenticated
                    ? 'Overview shows live Xero invoices. Approvals appear only after you run an investigation.'
                    : 'Use your work email, or continue with Xero to pull live contacts.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" variant="lime" asChild>
                  <Link to={isAuthenticated ? APP : LOGIN}>
                    {isAuthenticated ? 'Open desk' : 'Log in'} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-background">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.2fr_1fr_1fr] sm:px-6">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                Accounts receivable for UK SMEs. An investigations desk, not an unsupervised email bot.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Desk</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li>
                  <Link to={LOGIN} className="text-muted-foreground transition-colors hover:text-foreground">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link to={APP} className="text-muted-foreground transition-colors hover:text-foreground">
                    Collections desk
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>CashFlow OS</p>
            <p>Not affiliated with Xero.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
