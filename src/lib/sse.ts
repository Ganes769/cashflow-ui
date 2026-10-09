export interface SSEMessage {
  event?: string
  data: string
}

/** Parse one SSE event block (lines between blank-line separators). */
export function parseSSEBlock(block: string): SSEMessage | null {
  let event: string | undefined
  const dataLines: string[] = []
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^\s/, ''))
  }
  if (dataLines.length === 0) return null
  return { event, data: dataLines.join('\n') }
}

/** Split a growing buffer into complete SSE messages; returns leftover bytes as `rest`. */
export function parseSSEBuffer(buffer: string): { messages: SSEMessage[]; rest: string } {
  const messages: SSEMessage[] = []
  let rest = buffer
  while (true) {
    const match = rest.match(/\r?\n\r?\n/)
    if (!match || match.index === undefined) break
    const end = match.index + match[0].length
    const block = rest.slice(0, match.index)
    rest = rest.slice(end)
    const msg = parseSSEBlock(block)
    if (msg) messages.push(msg)
  }
  return { messages, rest }
}

export async function readSSEStream(
  body: ReadableStream<Uint8Array>,
  onMessage: (message: SSEMessage) => void,
  signal?: AbortSignal,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      if (signal?.aborted) return
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parsed = parseSSEBuffer(buffer)
      buffer = parsed.rest
      for (const message of parsed.messages) onMessage(message)
    }
    buffer += decoder.decode()
    if (buffer.trim()) {
      const msg = parseSSEBlock(buffer)
      if (msg) onMessage(msg)
    }
  } finally {
    reader.releaseLock()
  }
}
