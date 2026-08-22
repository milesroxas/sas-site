'use client'

import { useChat } from '@ai-sdk/react'
import { IconArrowUp } from '@tabler/icons-react'
import { type ChatTransport, DefaultChatTransport, type UIMessage } from 'ai'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Spinner } from '@/components/ui/spinner'
import { AskMessage, errorText } from './messages'

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

  // The transcript card mounts above the composer and can push it below the
  // fold; keep the composer in view when that happens.
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (hasTranscript) formRef.current?.scrollIntoView({ block: 'nearest' })
  }, [hasTranscript])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = question.trim()
    if (trimmed.length < MIN_QUESTION_LENGTH || busy) return
    void sendMessage({ text: trimmed })
    setQuestion('')
  }

  return (
    <div className="flex flex-col gap-4">
      {hasTranscript && (
        <Card className="h-[min(60svh,32rem)] gap-0 py-0">
          <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
            <MessageScrollerProvider autoScroll>
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent className="p-(--card-spacing)">
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
          </CardContent>
        </Card>
      )}

      {error && <p className="text-destructive text-sm">{errorText(error)}</p>}

      <form ref={formRef} onSubmit={submit} className="scroll-mb-8">
        <InputGroup>
          <InputGroupTextarea
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
            rows={2}
            required
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              className="ml-auto"
              disabled={busy || question.trim().length < MIN_QUESTION_LENGTH}
            >
              {busy ? <Spinner /> : <IconArrowUp />}
              <span className="sr-only">Ask</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  )
}
