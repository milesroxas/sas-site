'use client'

import { useChat } from '@ai-sdk/react'
import { type ChatTransport, DefaultChatTransport, type UIMessage } from 'ai'
import { useMemo, useState } from 'react'

export const MIN_QUESTION_LENGTH = 3

type UseAskChatOptions = {
  /** Transport override — stories/tests script the chat without /api/ask. */
  transport?: ChatTransport<UIMessage>
  /** Seed the transcript, e.g. for stories or resuming a conversation. */
  initialMessages?: UIMessage[]
  /** Runs after a question is accepted and sent (e.g. reveal the transcript). */
  onSend?: () => void
}

/**
 * Chat wiring shared by every Ask surface (the /ask page widget and the
 * takeover-menu composer): the /api/ask transport default, busy state, and
 * the min-length-guarded submit that clears the composer.
 */
export function useAskChat({ transport, initialMessages, onSend }: UseAskChatOptions) {
  const [question, setQuestion] = useState('')
  const chatTransport = useMemo(
    () => transport ?? new DefaultChatTransport<UIMessage>({ api: '/api/ask' }),
    [transport],
  )
  const { messages, sendMessage, status, error } = useChat({
    transport: chatTransport,
    messages: initialMessages,
  })

  const busy = status === 'submitted' || status === 'streaming'
  const canSend = !busy && question.trim().length >= MIN_QUESTION_LENGTH

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = question.trim()
    if (trimmed.length < MIN_QUESTION_LENGTH || busy) return
    void sendMessage({ text: trimmed })
    setQuestion('')
    onSend?.()
  }

  return { question, setQuestion, messages, status, error, busy, canSend, submit }
}
