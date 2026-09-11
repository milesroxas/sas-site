import type { UIMessage } from 'ai'
import { ASK_HANDOFFS, type AskUIMessage, handoffOf } from './handoff'

/** Cap on the combined text of the whole transcript: the history is client-supplied. */
export const ASK_HISTORY_MAX_CHARS = 8_000

type TextPart = Extract<UIMessage['parts'][number], { type: 'text' }>

/**
 * The transcript as the model may see it. It comes straight from the client,
 * so before it reaches the model: only user and assistant roles (a forged
 * system message would sit above our grounding rules), only text parts (file
 * and image parts would bill vision tokens; a handoff is a tool part, not
 * something the model said), and a hard budget on total characters (only
 * the last message has a length check of its own).
 *
 * A reply that was only a handoff keeps its place: the visitor read the
 * reason's lead line as the assistant's words, so that line stands in for the
 * turn. Dropping it left the model facing two unanswered questions in a row
 * and offering the same handoff again. A turn with nothing else to say is
 * dropped rather than sent as an empty message.
 */
export function askHistory(
  messages: UIMessage[],
  maxChars = ASK_HISTORY_MAX_CHARS,
): UIMessage[] | null {
  let totalChars = 0
  const history: UIMessage[] = []

  for (const message of messages) {
    if (message.role !== 'user' && message.role !== 'assistant') return null
    if (!Array.isArray(message.parts)) return null

    const parts: TextPart[] = message.parts.filter((part): part is TextPart => part.type === 'text')
    if (parts.length === 0 && message.role === 'assistant') {
      const lead = handoffLead(message)
      if (lead) parts.push({ type: 'text', text: lead })
    }
    for (const part of parts) totalChars += part.text.length
    if (totalChars > maxChars) return null

    if (parts.length > 0) history.push({ id: message.id, role: message.role, parts })
  }

  return history
}

/** The lead line the visitor saw for a handoff-only reply, or null when the turn carried no valid handoff. */
function handoffLead(message: UIMessage): string | null {
  const handoff = handoffOf(message as AskUIMessage)
  return handoff ? ASK_HANDOFFS[handoff.reason].lead : null
}
