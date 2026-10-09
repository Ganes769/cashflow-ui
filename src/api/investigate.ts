import { INVESTIGATE_STREAM_PATH, cashflowApiUrl } from './config'
import { readSSEStream, type SSEMessage } from '@/lib/sse'

/** Matches the deployed API `ChatRequest` schema (POST /investigate/stream). */
export interface InvestigateStreamRequest {
  message: string
  invoice_number?: string | null
}

export function buildInvestigateRequest(invoiceNumber: string, customerName?: string): InvestigateStreamRequest {
  const ref = invoiceNumber.trim()
  const who = customerName?.trim()
  const message = who
    ? `Investigate overdue invoice ${ref} for ${who}. Find why it has not been paid and recommend the next collection action.`
    : `Investigate overdue invoice ${ref}. Find why it has not been paid and recommend the next collection action.`
  return { message, invoice_number: ref || null }
}

export interface InvestigateStreamStepPayload {
  step: number
  status: 'started' | 'completed'
  tool: string
}

export interface InvestigateStreamResultPayload {
  response: string
}

export interface InvestigateStreamHandlers {
  onStep: (payload: InvestigateStreamStepPayload) => void
  onResult: (payload: InvestigateStreamResultPayload) => void
  onError: (message: string) => void
}

function messageFromUnknown(data: unknown): string {
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (typeof obj.message === 'string' && obj.message) return obj.message
    if (Array.isArray(obj.detail)) {
      const parts = obj.detail
        .map((item) => {
          if (!item || typeof item !== 'object') return null
          const row = item as { msg?: unknown; loc?: unknown[] }
          if (typeof row.msg === 'string' && row.msg) {
            const field = Array.isArray(row.loc) ? row.loc.filter((p) => typeof p === 'string').slice(-1)[0] : null
            return field ? `${field}: ${row.msg}` : row.msg
          }
          return null
        })
        .filter(Boolean)
      if (parts.length) return parts.join(' · ')
    }
    if (typeof obj.detail === 'string' && obj.detail) return obj.detail
    if (obj.detail && typeof obj.detail === 'object' && 'message' in obj.detail) {
      return String((obj.detail as { message: unknown }).message)
    }
  }
  return 'Something went wrong while investigating this invoice.'
}

function parseJsonData<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function dispatchSSE(message: SSEMessage, handlers: InvestigateStreamHandlers) {
  const eventName = (message.event ?? '').trim().toLowerCase()
  const raw = message.data.trim()
  if (!raw || raw === '[DONE]') return

  let inferred = eventName
  if (!inferred) {
    const asObj = parseJsonData<Record<string, unknown>>(raw)
    if (asObj && typeof asObj.response === 'string') inferred = 'result'
    else if (asObj && ('step' in asObj || 'tool' in asObj)) inferred = 'step'
    else if (asObj && ('message' in asObj || 'detail' in asObj)) inferred = 'error'
  }

  if (inferred === 'step') {
    const payload = parseJsonData<InvestigateStreamStepPayload>(raw)
    if (payload && typeof payload.step === 'number' && payload.tool && payload.status) {
      handlers.onStep(payload)
      return
    }
  }

  if (inferred === 'result') {
    const payload = parseJsonData<InvestigateStreamResultPayload>(raw)
    if (payload && typeof payload.response === 'string') {
      handlers.onResult(payload)
      return
    }
    handlers.onResult({ response: raw })
    return
  }

  if (inferred === 'error') {
    const payload = parseJsonData(raw)
    handlers.onError(messageFromUnknown(payload ?? raw))
  }
}

async function httpErrorMessage(response: Response): Promise<string> {
  const fallback = `Investigation failed (${response.status})`
  try {
    const text = await response.text()
    if (!text) return fallback
    const data = JSON.parse(text) as unknown
    return messageFromUnknown(data) || fallback
  } catch {
    return fallback
  }
}

/**
 * POST /investigate/stream — reads Server-Sent Events from the response body.
 * Uses fetch (not EventSource) so the request can include a JSON body.
 */
export async function streamInvestigation(
  request: InvestigateStreamRequest,
  handlers: InvestigateStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const url = cashflowApiUrl(INVESTIGATE_STREAM_PATH)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    throw new Error(await httpErrorMessage(response))
  }

  if (!response.body) {
    throw new Error('The server returned an empty investigation stream.')
  }

  let finished = false
  const wrap: InvestigateStreamHandlers = {
    onStep: handlers.onStep,
    onResult: (payload) => {
      finished = true
      handlers.onResult(payload)
    },
    onError: (message) => {
      finished = true
      handlers.onError(message)
    },
  }

  await readSSEStream(response.body, (message) => dispatchSSE(message, wrap), signal)

  if (!finished && !signal?.aborted) {
    wrap.onError('Investigation ended before a result was returned.')
  }
}
