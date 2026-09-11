'use client'

import { useChat } from '@ai-sdk/react'
import { type ChatTransport, DefaultChatTransport } from 'ai'
import { useMemo, useState } from 'react'
import type { AskUIMessage } from './handoff'

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
 * Chat wiring shared by every Ask surface (the /ask page widget and the
 * takeover-menu composer): the /api/ask transport default, busy state, and
 * the min-length-guarded submit that clears the composer, and `stop` for the
 * composer's in-flight Stop button.
 */
export function useAskChat({ transport, initialMessages, onSend }: UseAskChatOptions) {
  const [question, setQuestion] = useState('')
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
    void sendMessage({ text: trimmed })
    setQuestion('')
    onSend?.()
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendQuestion(question)
  }

  return {
    question,
    setQuestion,
    messages,
    setMessages,
    status,
    error,
    busy,
    canSend,
    submit,
    sendQuestion,
    stop,
  }
}
