'use client'

import { useChat } from '@ai-sdk/react'
import { type ChatTransport, DefaultChatTransport, type UIMessage } from 'ai'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import { Message, MessageContent } from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Textarea } from '@/components/ui/textarea'

const MIN_QUESTION_LENGTH = 3

type AskWidgetProps = {
  /**
   * Chat transport override — Storybook and tests inject a scripted transport
   * here; the real widget defaults to POSTing /api/ask.
   */
  transport?: ChatTransport<UIMessage>
  /** Seed the transcript, e.g. for stories or resuming a conversation. */
  initialMessages?: UIMessage[]
}

function errorText(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as { error?: unknown }
    if (typeof parsed.error === 'string') return parsed.error
  } catch {
    // not a JSON error body — fall through
  }
  return error.message || 'Something went wrong — try again.'
}

function AssistantSources({ message }: { message: UIMessage }) {
  const sources = message.parts.filter(
    (part): part is Extract<typeof part, { type: 'source-url' }> => part.type === 'source-url',
  )
  if (sources.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground text-xs font-medium">Sources</p>
      <ul className="flex flex-col gap-1">
        {sources.map((source) => (
          <li key={source.sourceId}>
            <Link href={source.url} className="text-xs underline underline-offset-4">
              {source.title ?? source.url}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AskMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const text = message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('')

  return (
    <Message align={isUser ? 'end' : 'start'}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'default' : 'ghost'}>
          <BubbleContent>
            <p className="whitespace-pre-wrap">{text}</p>
          </BubbleContent>
        </Bubble>
        {!isUser && <AssistantSources message={message} />}
      </MessageContent>
    </Message>
  )
}

export function AskWidget({ transport, initialMessages }: AskWidgetProps) {
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
  const hasTranscript = messages.length > 0

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = question.trim()
    if (trimmed.length < MIN_QUESTION_LENGTH || busy) return
    void sendMessage({ text: trimmed })
    setQuestion('')
  }

  return (
    <div className="flex flex-col gap-6">
      {hasTranscript && (
        <div className="h-96">
          <MessageScrollerProvider autoScroll>
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent>
                  {messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.role === 'user'}
                    >
                      <AskMessage message={message} />
                    </MessageScrollerItem>
                  ))}
                  {status === 'submitted' && (
                    <MessageScrollerItem messageId="pending">
                      <p className="shimmer text-muted-foreground text-xs/relaxed">Thinking…</p>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
      )}

      {error && <p className="text-destructive text-sm">{errorText(error)}</p>}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder="Ask something about our work, services, or insights…"
          maxLength={500}
          rows={3}
          required
        />
        <Button type="submit" disabled={busy || question.trim().length < MIN_QUESTION_LENGTH}>
          {busy ? 'Thinking…' : 'Ask'}
        </Button>
      </form>
    </div>
  )
}
