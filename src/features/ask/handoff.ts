import type { UIMessage } from 'ai'
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
 * Why a reply hands the visitor to a person, as the model may name it when it
 * calls the `handoff` tool (`handoffTool.ts`). Everything the transcript then
 * says is keyed by it in `ASK_HANDOFFS`: the model decides that a person
 * should take it from here, but never words the reply or the promise itself.
 */
export const ASK_TOOL_HANDOFF_REASONS = [
  'estimate',
  'project',
  'person',
  'contact_details',
  'no_answer',
] as const

/**
 * Every reason a reply can carry. `case_study` is code's alone: the question
 * is about a case study whose story is still thin (storyBrief.ts), which is a
 * fact about the record and never the model's to decide.
 */
export const ASK_HANDOFF_REASONS = [...ASK_TOOL_HANDOFF_REASONS, 'case_study'] as const

export type AskHandoffReason = (typeof ASK_HANDOFF_REASONS)[number]

export type AskToolHandoffReason = (typeof ASK_TOOL_HANDOFF_REASONS)[number]

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

/**
 * The page a reply points to next, as a card under the answer: the reply's
 * words never carry a path or a link (prompts.ts), so the way there is always
 * something to tap. One of the reply's own sources, picked by code (judge.ts,
 * `pickNextPage`).
 */
export type AskNextPage = { url: string; title: string }

/**
 * What Jev read in the question a reply answers (judge.ts, `isAside`), for
 * the transcript: an aside ("yes", "thanks", "can you pass this on?") tells
 * the team nothing, so the handoff form leaves it out of what it sends.
 */
export type AskTurnNote = { aside: boolean }

/** Data parts code writes into a reply beside the model's words (`data-nextPage`, `data-turn`). */
export type AskUIData = { nextPage: AskNextPage; turn: AskTurnNote }

/** One message in an Ask transcript: text, source links, the next page, and the handoff. */
export type AskUIMessage = UIMessage<unknown, AskUIData, AskUITools>

/** Whether the question this reply answers was an aside (`data-turn`). */
export function answersAnAside(message: Pick<AskUIMessage, 'parts'>): boolean {
  return message.parts.some((part) => part.type === 'data-turn' && part.data.aside)
}

/** The page card a reply carries, or null. */
export function nextPageOf(message: Pick<AskUIMessage, 'parts'>): AskNextPage | null {
  for (const part of message.parts) {
    if (part.type === 'data-nextPage') return part.data
  }
  return null
}

/**
 * When the handoff form opens without a tap:
 * - `always`: the visitor asked for it (a person, or their own contact details).
 * - `alone`: when the card is the whole reply (a price or a project the site
 *   cannot speak to), since then the team is the only thing to offer; under an
 *   answer it stays a quiet row, and the answer is read first.
 * - `never`: an offer the visitor may not want, one row until picked.
 */
export type AskHandoffOpens = 'always' | 'alone' | 'never'

type AskHandoffCopy = {
  /** What the inquiry is filed as, which decides who in the studio is notified. */
  form: InquiryType
  /**
   * The assistant's words when the reply is only the handoff, rendered as a
   * message before the offer. Code-owned, so a reply can never invent a
   * promise. The quiet `none` offer follows an answer that already has words.
   */
  lead: string | null
  /** The offer's line beside the "Email a partner" chip: a statement, so it is never answered by typing "yes". */
  offer: string
  opens: AskHandoffOpens
}

/** The chip that opens the form, and the chat header's control that does the same: what it does, in two words. */
export const ASK_HANDOFF_ACTION = 'Email a partner'

/**
 * The copy per kind. Every kind opens the same form and the same receipt, so
 * a visitor who meets the offer twice finds it where it was; only the words
 * that introduce it, and whether it opens by itself, follow the reason. An
 * estimate or a new project makes the conversation a project inquiry
 * (`askHandoffForm`).
 */
export const ASK_HANDOFFS: Record<AskHandoffKind, AskHandoffCopy> = {
  estimate: {
    form: 'project',
    lead: 'Pricing and timing depend on the project, so that one is for a partner.',
    offer: 'A partner can price it with you.',
    opens: 'alone',
  },
  project: {
    form: 'project',
    lead: 'That sounds like a project worth a real conversation.',
    offer: 'A partner can talk it through with you.',
    opens: 'alone',
  },
  person: {
    form: 'general',
    lead: 'Happy to put you in touch. Add your name and email and the team will take it from here.',
    offer: 'A partner can reply by email.',
    opens: 'always',
  },
  contact_details: {
    form: 'general',
    lead: 'Thanks. Add your name and email below and the team will take it from here.',
    offer: 'A partner can reply by email.',
    opens: 'always',
  },
  no_answer: {
    form: 'general',
    lead: "The site doesn't cover that, but the team can.",
    offer: 'A partner can answer that by email.',
    opens: 'never',
  },
  case_study: {
    form: 'general',
    lead: 'We have not published the full story of this project yet.',
    offer:
      'The full case study is still being written. A partner can walk you through it and similar work.',
    opens: 'never',
  },
  none: { form: 'general', lead: null, offer: 'A partner can reply by email.', opens: 'never' },
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

/**
 * What the visitor asked, oldest first, capped to the latest few. Asides
 * ("yes", "thanks", "can you pass this on?", as Jev read them: the reply after
 * one carries `data-turn`) tell the team nothing and are left out, unless
 * they are all there is.
 */
export function userQuestions(messages: AskUIMessage[]): string[] {
  const asked = messages.flatMap((message, index) => {
    if (message.role !== 'user') return []
    const text = messageText(message).trim()
    if (!text) return []
    const reply = messages[index + 1]
    return [{ text, aside: reply?.role === 'assistant' && answersAnAside(reply) }]
  })
  const kept = asked.some((question) => !question.aside)
    ? asked.filter((question) => !question.aside)
    : asked
  return kept.map((question) => question.text).slice(-MAX_QUESTIONS)
}

/**
 * What the inquiry is filed as: a project inquiry once any reply was about
 * the visitor's own project (a price, timing, or work they want done),
 * wherever in the conversation the form is opened; a general message
 * otherwise.
 */
export function askHandoffForm(messages: AskUIMessage[]): InquiryType {
  const project = messages.some((message) => {
    const handoff = message.role === 'assistant' ? handoffOf(message) : null
    return handoff !== null && ASK_HANDOFFS[handoff.reason].form === 'project'
  })
  return project ? 'project' : 'general'
}

/**
 * The handoff form as the visitor left it. The conversation keeps it, not
 * the form, so what was typed survives a new question (the form moves under
 * the reply that ends the transcript), another Ask surface, and navigation.
 */
export type AskHandoffDraft = {
  name: string
  /** Null until the visitor edits it: an address they wrote in the chat fills it until then. */
  email: string | null
  /** The visitor opened the form or typed in it, so it stays open under whichever reply ends the transcript. */
  open: boolean
  /** The reply whose form the visitor closed with "Not now", which must not open itself again. */
  closedUnder: string | null
  /** Bumped to bring the handoff into view: the chat header's "Email a partner". */
  reveal: number
}

export const ASK_HANDOFF_DRAFT_EMPTY: AskHandoffDraft = {
  name: '',
  email: null,
  open: false,
  closedUnder: null,
  reveal: 0,
}

/**
 * Whether the form under `reply` (the settled reply that ends the transcript)
 * is open: the visitor opened it or typed in it, or the reply's kind opens it
 * by itself (`AskHandoffOpens`) and they have not closed it there.
 */
export function askHandoffOpen(reply: AskUIMessage, draft: AskHandoffDraft): boolean {
  if (draft.open) return true
  if (draft.closedUnder === reply.id) return false
  const handoff = handoffOf(reply)
  if (!handoff) return false
  const { opens } = ASK_HANDOFFS[handoff.reason]
  return opens === 'always' || (opens === 'alone' && messageText(reply).trim() === '')
}

/** Words around an address that are not a name: "my name is", "here's my email", "sure". */
const CONTACT_FILLER =
  /\b(?:my|name|names|is|it's|its|i'm|im|i am|this is|here's|heres|here is|email|e-mail|address|and|at|sure|yes|ok|okay|thanks|thank you|please|hi|hello|hey|you can reach me|reach me)\b/gi

/** A name as people type one: one to four words of letters, with hyphens, apostrophes and initials. */
const NAME = /^[\p{L}][\p{L}'.-]*(?: [\p{L}][\p{L}'.-]*){0,3}$/u

/**
 * A chat message that is only contact details for the open form ("Jo Park,
 * jo@northwind.co", "sure, it's jo@northwind.co"): the address, and the name
 * when the rest reads as one. Null for anything that also says or asks
 * something, which stays a question. Read in the browser, so contact details
 * typed for the form never reach the model or the Ask log.
 */
export function contactFromMessage(text: string): { email: string; name: string | null } | null {
  const email = findEmailAddress(text)
  if (!email) return null
  const rest = text
    .replaceAll('\u2019', "'")
    .replace(email, ' ')
    .replace(CONTACT_FILLER, ' ')
    .replace(/[,:;!?()"]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.-]+|[\s.-]+$/g, '')
  if (rest === '') return { email, name: null }
  return NAME.test(rest) ? { email, name: rest } : null
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
export function askHandoffMessage(messages: AskUIMessage[]): string | null {
  const questions = userQuestions(messages)
  return questions.length > 0 ? questionsMessage(questions) : null
}

/**
 * An address the visitor already wrote in the chat, latest first, to start
 * the form's email field with. It never leaves the browser until they send.
 */
export function askHandoffEmail(messages: AskUIMessage[]): string | null {
  for (const question of userQuestions(messages).reverse()) {
    const email = findEmailAddress(question)
    if (email) return email
  }
  return null
}

/** Which chat, and which question in it, an inquiry from Ask closes. */
export type AskHandoffIds = { conversation: string; turn: string | null }

/** The handoff as the contact form reads it: the message to open with, and the ids to file under. */
export type AskHandoffPrefill = { message: string; ids: AskHandoffIds }

/** What an inquiry carries when it came from Ask: the intake reads `askConversation` as "from Ask". */
export const askInquiryFields = (ids: AskHandoffIds | null) =>
  ids ? { askConversation: ids.conversation, askTurn: ids.turn ?? undefined } : {}

/**
 * Carry the visitor's Ask questions to the contact form, in this tab's
 * sessionStorage and never in the URL: PostHog records full URLs and servers log
 * them, and the contact page stays static because only the browser reads it.
 * Blocked storage just means the form opens empty.
 */
export function saveAskHandoff(messages: AskUIMessage[], ids: AskHandoffIds): void {
  const questions = userQuestions(messages)
  if (questions.length === 0) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ questions, savedAt: Date.now(), ...ids }))
  } catch {
    // Storage unavailable (private mode, blocked site data): nothing to carry.
  }
}

/**
 * The handoff to prefill the contact form with, or null: after half an hour,
 * or for an entry with no chat to file under.
 *
 * Deliberately not cleared on read: on a full page load the contact page
 * remounts its form right after hydration, and a one-shot read would be spent
 * on the first mount and leave the second one empty. The handoff is cleared
 * once the inquiry is sent (`clearAskHandoff`).
 */
export function readAskHandoff(): AskHandoffPrefill | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const { questions, savedAt, conversation, turn } = JSON.parse(raw) as {
      questions?: unknown
      savedAt?: unknown
      conversation?: unknown
      turn?: unknown
    }
    if (typeof savedAt !== 'number' || Date.now() - savedAt > MAX_AGE_MS) return null
    if (typeof conversation !== 'string') return null
    const lines = Array.isArray(questions)
      ? questions.filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
      : []
    if (lines.length === 0) return null

    return {
      message: `${questionsMessage(lines)}\n\n`,
      ids: { conversation, turn: typeof turn === 'string' ? turn : null },
    }
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
