import { INVESTIGATE_SEND_PATH, cashflowApiUrl } from './config'

export interface SendInvestigationEmailRequest {
  invoice_number: string
  subject: string
  body: string
}

export interface SendInvestigationEmailResponse {
  status: string
  id: string
  to: string
  invoice_number: string
}

function detailFromJson(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const detail = (data as { detail?: unknown }).detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const row = item as { msg?: unknown }
        return typeof row.msg === 'string' ? row.msg : null
      })
      .filter(Boolean)
    if (parts.length) return parts.join(' · ')
  }
  if (detail !== undefined) return JSON.stringify(detail)
  return null
}

async function readDetail(response: Response): Promise<string | null> {
  try {
    return detailFromJson(await response.json())
  } catch {
    return null
  }
}

export class SendEmailError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'SendEmailError'
    this.status = status
  }
}

export async function sendInvestigationEmail(request: SendInvestigationEmailRequest): Promise<SendInvestigationEmailResponse> {
  const response = await fetch(cashflowApiUrl(INVESTIGATE_SEND_PATH), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      invoice_number: request.invoice_number,
      subject: request.subject.slice(0, 255),
      body: request.body,
    }),
  })

  if (response.status === 200) {
    return (await response.json()) as SendInvestigationEmailResponse
  }

  const detail = await readDetail(response)

  if (response.status === 404) throw new SendEmailError(detail || 'Invoice not found.', 404)
  if (response.status === 502) throw new SendEmailError(detail || 'The email provider rejected the message.', 502)
  if (response.status === 503) throw new SendEmailError(detail || 'Email sending is not configured.', 503)
  if (response.status === 400 || response.status === 422) {
    throw new SendEmailError(detail || 'The invoice cannot be emailed.', response.status)
  }

  throw new SendEmailError(detail || `Could not send email (${response.status})`, response.status)
}
