import type { UIMessage } from 'ai'

/** Where "Talk to the team" sends the visitor: the general contact form. */
export const ASK_HANDOFF_HREF = '/contact'

const STORAGE_KEY = 'ask:handoff'

/** A handoff left behind by a visitor who wandered off is ignored, not pasted. */
const MAX_AGE_MS = 30 * 60_000

/** The latest few questions, capped so the visitor keeps room to write. */
const MAX_QUESTIONS = 5
const MAX_PREFILL_CHARS = 600

const PREFILL_HEADING = 'From my Ask conversation:'

function userQuestions(messages: UIMessage[]): string[] {
  return messages
    .filter((message) => message.role === 'user')
    .map((message) =>
      message.parts
        .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
        .map((part) => part.text)
        .join('')
        .trim(),
    )
    .filter(Boolean)
    .slice(-MAX_QUESTIONS)
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

    const text = `${PREFILL_HEADING}\n${lines.map((line) => `- ${line}`).join('\n')}`
    return `${text.slice(0, MAX_PREFILL_CHARS)}\n\n`
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
