'use client'

import { useChat } from '@ai-sdk/react'
import { type ChatTransport, DefaultChatTransport, generateId } from 'ai'
import { useCallback, useMemo, useState } from 'react'
import { useAskSession } from './AskSession'
import { type AskFeedback, type AskRated, postAskFeedback } from './feedback'
import type { AskHandoffReceipt, AskHandoffSent } from './HandoffPanel'
import {
  ASK_HANDOFF_DRAFT_EMPTY,
  type AskHandoffDraft,
  type AskUIMessage,
  askHandoffOpen,
  askHandoffState,
  contactFromMessage,
} from './handoff'
import { ASK_QUESTION_LENGTH, type AskHandoffSignal } from './vocabulary'

type UseAskChatOptions = {
  /** Transport override: stories and tests script the chat without /api/ask. */
  transport?: ChatTransport<AskUIMessage>
  /** Seed the transcript, e.g. for stories or resuming a conversation. */
  initialMessages?: AskUIMessage[]
  /** Runs after a question is accepted and sent (e.g. reveal the transcript). */
  onSend?: () => void
}

/**
 * Chat wiring shared by every Ask surface (the takeover-menu composer, the
 * closing band, and the /ask page widget): the /api/ask transport default,
 * busy state, the min-length-guarded submit that clears the composer,
 * `stop` for the composer's in-flight Stop button, the one handoff the
 * conversation can send, and the visitor's feedback on each turn.
 *
 * On the site every surface reads the one conversation in `AskSession`, so
 * a question asked in the menu is on the closing band's transcript too, in
 * the same chat in the log; only the composer's draft and `onSend` are the
 * surface's own. A scripted surface (a `transport` or a seeded transcript:
 * stories and tests) and anything outside the provider keeps a chat to itself.
 *
 * The handoff form's draft is the conversation's too (`AskHandoffDraft`), so
 * what the visitor typed into it outlives a new question and a surface
 * switch. While the form is open, a message that is only contact details
 * ("Jo Park, jo@northwind.co") fills it instead of becoming a question: read
 * in the browser, so it never reaches the model or the Ask log.
 *
 * Every request carries where the conversation stands with the team
 * (`handoff`: none, offered, sent) next to the page it was asked on, so the
 * endpoint can keep the model from offering twice and drop the offer
 * entirely once the visitor has sent.
 */
export function useAskChat({ transport, initialMessages, onSend }: UseAskChatOptions) {
  const session = useAskSession()
  const shared = transport || initialMessages ? null : session
  const [question, setQuestion] = useState('')
  const [ownSent, setOwnSent] = useState<AskHandoffSent | null>(null)
  const [ownRatings, setOwnRatings] = useState<AskFeedback['ratings']>({})
  const [ownDraft, setOwnDraft] = useState<AskHandoffDraft>(ASK_HANDOFF_DRAFT_EMPTY)
  const sent = shared ? shared.sent : ownSent
  const setSent = shared ? shared.setSent : setOwnSent
  const ratings = shared ? shared.ratings : ownRatings
  const setRatings = shared ? shared.setRatings : setOwnRatings
  const draft = shared ? shared.draft : ownDraft
  const setDraft = shared ? shared.setDraft : setOwnDraft
  // The chat id files every turn of one conversation; a reset mints a new
  // one (which is also what empties the transcript) so two conversations
  // from one open box never share a thread in the log. The seed is spent
  // on the first chat only.
  const [ownId, setOwnId] = useState(generateId)
  const [seed, setSeed] = useState(initialMessages)
  const chatTransport = useMemo(
    () =>
      transport ??
      new DefaultChatTransport<AskUIMessage>({
        api: '/api/ask',
        // Resolved per request, so it is the page the question was asked on
        // even after client-side navigation. Stored with the question.
        body: () => ({ pagePath: window.location.pathname }),
      }),
    [transport],
  )
  const { messages, sendMessage, status, error, stop } = useChat<AskUIMessage>(
    shared ? { chat: shared.chat } : { id: ownId, transport: chatTransport, messages: seed },
  )
  const id = shared ? shared.chat.id : ownId

  const busy = status === 'submitted' || status === 'streaming'
  const canSend = !busy && question.trim().length >= ASK_QUESTION_LENGTH.min
  const last = messages.at(-1)
  /** The form under the settled reply that ends the transcript is open, with nothing sent yet. */
  const formOpen =
    status === 'ready' && sent === null && last?.role === 'assistant' && askHandoffOpen(last, draft)

  function sendQuestion(text: string) {
    const trimmed = text.trim()
    if (trimmed.length < ASK_QUESTION_LENGTH.min || busy) return
    // Contact details typed into the chat while the form is open are for the
    // form: they fill it, and it comes into view with them in place.
    const contact = formOpen ? contactFromMessage(trimmed) : null
    if (contact) {
      setDraft((current) => ({
        ...current,
        open: true,
        email: contact.email,
        name: contact.name ?? current.name,
        reveal: current.reveal + 1,
      }))
      setQuestion('')
      return
    }
    // Where the conversation stands with the team as this question leaves,
    // merged into the transport's body beside `pagePath`.
    void sendMessage(
      { text: trimmed },
      { body: { handoff: askHandoffState(messages, sent !== null) } },
    )
    setQuestion('')
    onSend?.()
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendQuestion(question)
  }

  /** The visitor sent their details from the handoff under `messageId`; the draft is spent. */
  function markSent(messageId: string, receipt: AskHandoffReceipt) {
    setSent({ messageId, receipt })
    setDraft((current) => ({ ...ASK_HANDOFF_DRAFT_EMPTY, reveal: current.reveal }))
  }

  /**
   * The chat header's "Email a partner": the form, open under the reply that
   * ends the transcript and brought into view; once sent, the receipt.
   */
  function openHandoff() {
    setDraft((current) => ({
      ...current,
      open: sent === null,
      closedUnder: null,
      reveal: current.reveal + 1,
    }))
  }

  /** A new conversation: the transcript, what it sent, and what it rated go together. */
  function reset() {
    if (shared) return shared.reset()
    setOwnId(generateId())
    setSeed(undefined)
    setOwnSent(null)
    setOwnRatings({})
    setOwnDraft(ASK_HANDOFF_DRAFT_EMPTY)
  }

  // Shown at once and posted behind it; the server keeps the first rating
  // (a reason may follow it) and the strongest handoff signal, so a repeat
  // changes nothing there. Memoized: it is a context value read by every
  // rating control in the transcript.
  const rate = useCallback(
    (turn: string, rated: AskRated) => {
      setRatings((current) => ({ ...current, [turn]: rated }))
      postAskFeedback({ id, turn, rating: rated.rating, reason: rated.reason })
    },
    [id, setRatings],
  )
  const handoff = useCallback(
    (turn: string, signal: AskHandoffSignal) => postAskFeedback({ id, turn, handoff: signal }),
    [id],
  )
  const feedback = useMemo<AskFeedback>(
    () => ({ conversation: id, ratings, rate, handoff }),
    [id, ratings, rate, handoff],
  )

  return {
    question,
    setQuestion,
    messages,
    status,
    error,
    busy,
    canSend,
    submit,
    sendQuestion,
    stop,
    sent,
    markSent,
    draft,
    setDraft,
    openHandoff,
    reset,
    feedback,
  }
}
