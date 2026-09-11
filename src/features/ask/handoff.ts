import type { UIDataTypes, UIMessage } from 'ai'
import type { InquiryType } from '@/shared/content/inquiry'
import { findEmailAddress } from '@/utilities/emailAddress'
import { messageText } from './messageText'

/** Where "Talk to the team" sends the visitor: the general contact form. */
export const ASK_HANDOFF_HREF = '/contact'

/**
 * Why a reply hands the visitor to a person. The model names one when it
 * calls the `handoff` tool (`handoffTool.ts`), and everything the card then
 * says is keyed by it in `ASK_HANDOFFS`: the model decides that a person
 * should take it from here, but never words the promise itself.
 */
export const ASK_HANDOFF_REASONS = [
  'estimate',
  'project',
  'person',
  'contact_details',
  'no_answer',
] as const

export type AskHandoffReason = (typeof ASK_HANDOFF_REASONS)[number]

/** The handoff as the server resolves it: what the card promises, from Site Info. */
export type AskHandoff = {
  reason: AskHandoffReason
  /** Site Info › Inquiries › Response time, completing "you'll hear back ___". */
  responseTime: string
  /** Site Info's booking link, or null to leave "Book a call" off the receipt. */
  scheduleUrl: string | null
}

/** Tools the Ask model can call, as the transcript's typed tool parts (`tool-handoff`). */
export type AskUITools = {
  handoff: { input: { reason: AskHandoffReason }; output: AskHandoff }
}

/** One message in an Ask transcript: text, source links, and the handoff card. */
export type AskUIMessage = UIMessage<unknown, UIDataTypes, AskUITools>

type AskHandoffCard = {
  /** What the inquiry is filed as, which decides who in the studio is notified. */
  form: InquiryType
  /** The answer the card gives in place of a reply. */
  title: string
}

/**
 * The card per reason. The title answers; the rest of the card is the same
 * for every reason (`askHandoffPromise`, the send action), so a visitor who
 * meets it twice finds it where it was. An estimate or a new project is filed
 * as a project inquiry; everything else as a general message.
 */
export const ASK_HANDOFFS: Record<AskHandoffReason, AskHandoffCard> = {
  estimate: { form: 'project', title: 'Priced and scheduled per project' },
  project: { form: 'project', title: 'Tell us about your project' },
  person: { form: 'general', title: 'A partner can take it from here' },
  contact_details: { form: 'general', title: 'Send your details to the team' },
  no_answer: { form: 'general', title: "The site doesn't cover that yet" },
}

/** The card's promise: a person, by email, on Site Info's clock. */
export const askHandoffPromise = (responseTime: string) =>
  `A partner will reply by email ${responseTime}.`

/**
 * The handoff a reply ends with, once the server has resolved it. A reason
 * this build has no card for (a transcript from before a deploy) shows none.
 */
export function handoffOf(message: AskUIMessage): AskHandoff | null {
  for (const part of message.parts) {
    if (
      part.type === 'tool-handoff' &&
      part.state === 'output-available' &&
      ASK_HANDOFF_REASONS.includes(part.output.reason)
    ) {
      return part.output
    }
  }
  return null
}

const STORAGE_KEY = 'ask:handoff'

/** A handoff left behind by a visitor who wandered off is ignored, not pasted. */
const MAX_AGE_MS = 30 * 60_000

/** The latest few questions, capped so the visitor keeps room to write. */
const MAX_QUESTIONS = 5
const MAX_PREFILL_CHARS = 600

const PREFILL_HEADING = 'From my Ask conversation:'

/** What the visitor asked, oldest first, capped to the latest few. */
export function userQuestions(messages: UIMessage[]): string[] {
  return messages
    .filter((message) => message.role === 'user')
    .map((message) => messageText(message).trim())
    .filter(Boolean)
    .slice(-MAX_QUESTIONS)
}

/**
 * The visitor's questions as an inquiry's message, in their own words: what
 * the contact form opens with after "Talk to the team", and what the handoff
 * card sends.
 */
function questionsMessage(questions: string[]): string {
  const text = `${PREFILL_HEADING}\n${questions.map((question) => `- ${question}`).join('\n')}`
  return text.slice(0, MAX_PREFILL_CHARS)
}

/** The message the handoff card sends, or null before anything was asked. */
export function askHandoffMessage(messages: UIMessage[]): string | null {
  const questions = userQuestions(messages)
  return questions.length > 0 ? questionsMessage(questions) : null
}

/**
 * An address the visitor already wrote in the chat, latest first, to start
 * the card's email field with. It never leaves the browser until they send.
 */
export function askHandoffEmail(messages: UIMessage[]): string | null {
  for (const question of userQuestions(messages).reverse()) {
    const email = findEmailAddress(question)
    if (email) return email
  }
  return null
}

/**
 * Carry the visitor's Ask questions to the contact form, in this tab's
 * sessionStorage and never in the URL: PostHog records full URLs and servers log
 * them, and the contact page stays static because only the browser reads it.
 * Blocked storage just means the form opens empty.
 */
export function saveAskHandoff(messages: UIMessage[]): void {
  const questions = userQuestions(messages)
  if (questions.length === 0) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ questions, savedAt: Date.now() }))
  } catch {
    // Storage unavailable (private mode, blocked site data): nothing to carry.
  }
}

/**
 * The text to prefill the contact form's message with, or null.
 *
 * Deliberately not cleared on read: on a full page load the contact page
 * remounts its form right after hydration, and a one-shot read would be spent
 * on the first mount and leave the second one empty. The handoff is cleared
 * once the inquiry is sent (`clearAskHandoff`), and ignored after half an hour.
 */
export function readAskHandoff(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const { questions, savedAt } = JSON.parse(raw) as { questions?: unknown; savedAt?: unknown }
    if (typeof savedAt !== 'number' || Date.now() - savedAt > MAX_AGE_MS) return null
    const lines = Array.isArray(questions)
      ? questions.filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
      : []
    if (lines.length === 0) return null

    return `${questionsMessage(lines)}\n\n`
  } catch {
    return null
  }
}

/** Once the inquiry is sent, the questions have arrived; drop them. */
export function clearAskHandoff(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable: there is nothing to clear.
  }
}
