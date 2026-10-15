import type { InvestigateStreamResultPayload } from '@/api/investigate'

export interface InvestigationEmailDraft {
  to: string | null
  customer: string | null
  invoice_number: string | null
  subject: string
  body: string
  can_send: boolean
}

const SUBJECT_MARKER = /(?:^|\n)\s*(?:\*\*)?Subject:(?:\*\*)?\s*/i
const BODY_MARKER = /(?:^|\n)\s*(?:\*\*)?Body:(?:\*\*)?\s*/i

function stripMarks(value: string) {
  return value.replace(/\*\*/g, '').trim()
}

/** Split the agent reply into the finding and the letter. Do not invent subject/body. */
export function splitInvestigationResponse(response: string): { finding: string; subject: string; body: string } {
  const text = response.replace(/\u00a0/g, ' ')
  const subjectMatch = text.match(SUBJECT_MARKER)
  if (!subjectMatch || subjectMatch.index === undefined) {
    return { finding: text.trim(), subject: '', body: '' }
  }

  const finding = text.slice(0, subjectMatch.index).trim()
  const afterSubject = text.slice(subjectMatch.index + subjectMatch[0].length)
  const bodyMatch = afterSubject.match(BODY_MARKER)

  if (bodyMatch && bodyMatch.index !== undefined) {
    return {
      finding,
      subject: stripMarks(afterSubject.slice(0, bodyMatch.index)),
      body: stripMarks(afterSubject.slice(bodyMatch.index + bodyMatch[0].length)),
    }
  }

  const lineBreak = afterSubject.search(/\r?\n/)
  if (lineBreak < 0) return { finding, subject: stripMarks(afterSubject), body: '' }

  return {
    finding,
    subject: stripMarks(afterSubject.slice(0, lineBreak)),
    body: afterSubject.slice(lineBreak).trim(),
  }
}

export function mapInvestigationEmail(result: InvestigateStreamResultPayload): InvestigationEmailDraft {
  const letter = splitInvestigationResponse(result.response)
  return {
    to: result.email ?? null,
    customer: result.customer ?? null,
    invoice_number: result.invoice_number ?? null,
    subject: letter.subject,
    body: letter.body,
    can_send: result.can_send === true,
  }
}
