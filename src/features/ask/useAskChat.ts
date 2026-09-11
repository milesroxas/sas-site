'use client'

import { useChat } from '@ai-sdk/react'
import { type ChatTransport, DefaultChatTransport } from 'ai'
import { useMemo, useState } from 'react'
import type { AskHandoffReceipt, AskHandoffSent } from './HandoffPanel'
import { type AskUIMessage, askHandoffState } from './handoff'

export const MIN_QUESTION_LENGTH = 3

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
 * `stop` for the composer's in-flight Stop button, and the one handoff the
 * conversation can send.
 *
 * Every request carries where the conversation stands with the team
 * (`handoff`: none, offered, sent) next to the page it was asked on, so the
 * endpoint can keep the model from offering twice and drop the offer
 * entirely once the visitor has sent.
 */
export function useAskChat({ transport, initialMessages, onSend }: UseAskChatOptions) {
  const [question, setQuestion] = useState('')
  const [sent, setSent] = useState<AskHandoffSent | null>(null)
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
  const { messages, sendMessage, status, error, setMessages, stop } = useChat<AskUIMessage>({
    transport: chatTransport,
    messages: initialMessages,
  })

  const busy = status === 'submitted' || status === 'streaming'
  const canSend = !busy && question.trim().length >= MIN_QUESTION_LENGTH

  function sendQuestion(text: string) {
    const trimmed = text.trim()
    if (trimmed.length < MIN_QUESTION_LENGTH || busy) return
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

  /** The visitor sent their details from the handoff under `messageId`. */
  function markSent(messageId: string, receipt: AskHandoffReceipt) {
    setSent({ messageId, receipt })
  }

  /** A new conversation: the transcript and what it sent go together. */
  function reset() {
    setMessages([])
    setSent(null)
  }

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
    reset,
  }
}
