import { type ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** Entrance motion without hiding content first. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = usePrefersReducedMotion()
  return (
    <div className={cn(!reduced && 'ui-rise', className)} style={reduced ? undefined : { animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export function useCycle<T>(items: readonly T[], intervalMs: number) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced || items.length < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs)
    return () => window.clearInterval(id)
  }, [items.length, intervalMs, reduced])

  return { item: items[index]!, index }
}
