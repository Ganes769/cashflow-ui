import { useCallback, useEffect, useRef, useState } from 'react'
import { buildInvestigateRequest, streamInvestigation, type InvestigateStreamStepPayload } from '@/api/investigate'

export interface StreamInvestigationStep {
  key: string
  step: number
  tool: string
  status: 'running' | 'completed'
}

function upsertStep(prev: StreamInvestigationStep[], payload: InvestigateStreamStepPayload): StreamInvestigationStep[] {
  const key = `${payload.step}-${payload.tool}`
  const status = payload.status === 'completed' ? 'completed' : 'running'
  const idx = prev.findIndex((s) => s.key === key)
  if (idx >= 0) {
    const next = [...prev]
    next[idx] = { ...next[idx]!, status }
    return next
  }
  return [...prev, { key, step: payload.step, tool: payload.tool, status }]
}

function sortSteps(steps: StreamInvestigationStep[]) {
  return [...steps].sort((a, b) => a.step - b.step || a.tool.localeCompare(b.tool))
}

export function useInvestigateStream(invoiceNumber: string, customerName: string) {
  const [steps, setSteps] = useState<StreamInvestigationStep[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [investigating, setInvestigating] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const investigate = useCallback(() => {
    if (!invoiceNumber.trim()) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setSteps([])
    setResult(null)
    setError(null)
    setInvestigating(true)

    void streamInvestigation(
      buildInvestigateRequest(invoiceNumber, customerName),
      {
        onStep: (payload) => {
          setSteps((prev) => sortSteps(upsertStep(prev, payload)))
        },
        onResult: (payload) => {
          setResult(payload.response)
          setInvestigating(false)
        },
        onError: (message) => {
          setError(message)
          setInvestigating(false)
        },
      },
      controller.signal,
    ).catch((err: unknown) => {
      if (controller.signal.aborted) return
      const message = err instanceof Error ? err.message : 'Could not reach the investigation service.'
      setError(message)
      setInvestigating(false)
    })
  }, [customerName, invoiceNumber])

  return { steps, result, error, investigating, investigate }
}
