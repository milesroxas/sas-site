import type { UIDataTypes, UIMessage } from 'ai'
import type { SiteInfo } from '@/payload-types'
import {
  INQUIRY_RESPONSE_TIME_FALLBACK,
  type InquiryType,
  inquiryResponseTime,
} from '@/shared/content/inquiry'
import { findEmailAddress } from '@/utilities/emailAddress'
import { messageText } from './messageText'

/** Where the contact-page fallback sends the visitor: the general contact form. */
export const ASK_HANDOFF_HREF = '/contact'

/**
 * Why a reply hands the visitor to a person. The model names one when it
 * calls the `handoff` tool (`handoffTool.ts`), and everything the transcript
 * then says is keyed by it in `ASK_HANDOFFS`: the model decides that a person
 * should take it from here, but never words the reply or the promise itself.
 */
export const ASK_HANDOFF_REASONS = [
  'estimate',
  'project',
  'person',
  'contact_details',
  'no_answer',
] as const

export type AskHandoffReason = (typeof ASK_HANDOFF_REASONS)[number]

/** What Site Info promises whoever reaches a person: the reply time and the booking link. */
export type AskHandoffTerms = {
  /** Site Info › Inquiries › Response time, completing "you'll hear back ___". */
  responseTime: string
  /** Site Info's booking link, or null to leave "Book a call" off the receipt. */
  scheduleUrl: string | null
}

/** The terms a surface falls back to before Site Info has been read for it. */
export const ASK_HANDOFF_TERMS_FALLBACK: AskHandoffTerms = {
  responseTime: INQUIRY_RESPONSE_TIME_FALLBACK,
  scheduleUrl: null,
}

/**
 * Site Info's terms, read once per surface on the server and handed to the
 * transcript for the quiet offer, which carries no resolved handoff of its
 * own. Client-safe: types and one string fallback.
 */
export function resolveAskHandoffTerms(
  siteInfo: Pick<SiteInfo, 'inquiries'> | null | undefined,
): AskHandoffTerms {
  return {
    responseTime: inquiryResponseTime(siteInfo),
    scheduleUrl: siteInfo?.inquiries?.scheduleUrl || null,
  }
}

/** The handoff as the server resolves it: the model's reason with Site Info's terms. */
export type AskHandoff = AskHandoffTerms & { reason: AskHandoffReason }

/**
 * A handoff's kind in the transcript: the model's reason, or `none` for the
 * quiet offer that closes any other finished answer. Both open the same form.
 */
export type AskHandoffKind = AskHandoffReason | 'none'

/** Tools the Ask model can call, as the transcript's typed tool parts (`tool-handoff`). */
export type AskUITools = {
  handoff: { input: { reason: AskHandoffReason }; output: AskHandoff }
}

/** One message in an Ask transcript: text, source links, and the handoff. */
export type AskUIMessage = UIMessage<unknown, UIDataTypes, AskUITools>

type AskHandoffCopy = {
  /** What the inquiry is filed as, which decides who in the studio is notified. */
  form: InquiryType
  /**
   * The assistant's words when the reply is only the handoff, rendered as a
   * message before the offer. Code-owned, so a reply can never invent a
   * promise. The quiet `none` offer follows an answer that already has words.
   */
  lead: string | null
  /** The offer's line beside "Talk to the team". */
  offer: string
}

/**
 * The copy per kind. Every kind opens the same form and the same receipt, so
 * a visitor who meets the offer twice finds it where it was; only the words
 * that introduce it, and where the inquiry is filed, follow the reason. An
 * estimate or a new project is filed as a project inquiry; everything else
 * as a general message.
 */
export const ASK_HANDOFFS: Record<AskHandoffKind, AskHandoffCopy> = {
  estimate: {
    form: 'project',
    lead: 'Pricing and timing depend on the project, so that one is for a partner.',
    offer: 'Want a partner to price it?',
  },
  project: {
    form: 'project',
    lead: 'That sounds like a project worth a real conversation.',
    offer: 'Want to talk it through with a partner?',
  },
  person: {
    form: 'general',
    lead: "That's one for a person, not the chat.",
    offer: 'Want a partner to reply?',
  },
  contact_details: {
    form: 'general',
    lead: "Thanks. This chat can't pass details on, but the team can take it from here.",
    offer: 'Send your details to the team?',
  },
  no_answer: {
    form: 'general',
    lead: "There's nothing on the site about that yet.",
    offer: 'Want a person to answer?',
  },
  none: { form: 'general', lead: null, offer: 'Want a person to reply?' },
}

/** The form's promise: a person, by email, on Site Info's clock. */
export const askHandoffPromise = (responseTime: string) =>
  `A partner will reply by email ${responseTime}.`

/**
 * Where a conversation stands with the team, sent with every question so the
 * model never offers twice: `offered` once any reply carried a handoff,
 * `sent` once the visitor's details have gone to the inbox.
 */
export const ASK_HANDOFF_STATES = ['none', 'offered', 'sent'] as const

export type AskHandoffState = (typeof ASK_HANDOFF_STATES)[number]

/**
 * The handoff a reply ends with, once the server has resolved it. A reason
 * this build has no copy for (a transcript from before a deploy) shows none.
 */
export function handoffOf(message: Pick<AskUIMessage, 'parts'>): AskHandoff | null {
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

/** The conversation's handoff state from its transcript and whether the surface has sent. */
export function askHandoffState(messages: AskUIMessage[], sent: boolean): AskHandoffState {
  if (sent) return 'sent'
  return messages.some((message) => message.role === 'assistant' && handoffOf(message) !== null)
    ? 'offered'
    : 'none'
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
 * the contact form opens with after the fallback link, and what the handoff
 * form sends.
 */
function questionsMessage(questions: string[]): string {
  const text = `${PREFILL_HEADING}\n${questions.map((question) => `- ${question}`).join('\n')}`
  return text.slice(0, MAX_PREFILL_CHARS)
}

/** The message the handoff form sends, or null before anything was asked. */
export function askHandoffMessage(messages: UIMessage[]): string | null {
  const questions = userQuestions(messages)
  return questions.length > 0 ? questionsMessage(questions) : null
}

/**
 * An address the visitor already wrote in the chat, latest first, to start
 * the form's email field with. It never leaves the browser until they send.
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
