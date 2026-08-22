'use client'

import { useChat } from '@ai-sdk/react'
import { IconArrowUp } from '@tabler/icons-react'
import { type ChatTransport, DefaultChatTransport, type UIMessage } from 'ai'
import { startTransition, useEffect, useMemo, useState, ViewTransition } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
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

type MenuAskProps = {
  /** Takeover-menu open state — closing the menu returns to the preview view. */
  open: boolean
  /**
   * Fires when the transcript takes over / releases the preview window, so the
   * menu can fade the docked page frame under it.
   */
  onViewChange?: (chatView: boolean) => void
  /** Transport override for stories/tests, same seam as AskWidget. */
  transport?: ChatTransport<UIMessage>
  initialMessages?: UIMessage[]
}

/**
 * The takeover menu's Ask surface: a floating pill composer under the page
 * preview. Submitting swaps the preview window for the transcript panel — the
 * swap is a React View Transition (`menu-chat` classes in view-transition.css).
 */
export function MenuAsk({ open, onViewChange, transport, initialMessages }: MenuAskProps) {
  const [question, setQuestion] = useState('')
  const [chatView, setChatView] = useState(false)
  const chatTransport = useMemo(
    () => transport ?? new DefaultChatTransport<UIMessage>({ api: '/api/ask' }),
    [transport],
  )
  const { messages, sendMessage, status, error } = useChat({
    transport: chatTransport,
    messages: initialMessages,
  })

  const busy = status === 'submitted' || status === 'streaming'

  // Closing the menu hands the window back to the page preview.
  useEffect(() => {
    if (!open) setChatView(false)
  }, [open])

  useEffect(() => {
    onViewChange?.(chatView)
  }, [chatView, onViewChange])

  const showTranscript = () => {
    // startTransition activates the <ViewTransition> enter animation.
    startTransition(() => setChatView(true))
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = question.trim()
    if (trimmed.length < MIN_QUESTION_LENGTH || busy) return
    void sendMessage({ text: trimmed })
    setQuestion('')
    showTranscript()
  }

  return (
    <>
      {/* The docked page frame lands exactly on this slot (measured by the
          menu's GSAP timeline); the transcript replaces it in place. */}
      <div
        data-menu-preview-slot
        className="pointer-events-none relative aspect-video w-full md:aspect-auto md:min-h-0 md:flex-1"
      >
        {chatView && (
          <ViewTransition enter="menu-chat" exit="menu-chat" default="none">
            <section
              aria-label="Ask transcript"
              data-lenis-prevent
              className="bg-popover text-popover-foreground shadow-2xl pointer-events-auto absolute inset-0 flex flex-col overflow-hidden rounded-4xl"
            >
              <MessageScrollerProvider autoScroll>
                <MessageScroller className="min-h-0 flex-1">
                  <MessageScrollerViewport className="overscroll-contain">
                    <MessageScrollerContent className="p-4">
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
                      {error && (
                        <MessageScrollerItem messageId="error">
                          <p className="text-destructive text-xs/relaxed">{errorText(error)}</p>
                        </MessageScrollerItem>
                      )}
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton />
                </MessageScroller>
              </MessageScrollerProvider>
            </section>
          </ViewTransition>
        )}
      </div>

      <form data-menu-item onSubmit={submit}>
        <InputGroup variant="pill">
          <InputGroupInput
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onFocus={() => {
              // Returning to a running conversation brings the transcript back.
              if (messages.length > 0) showTranscript()
            }}
            placeholder="Ask anything…"
            maxLength={500}
            required
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={busy || question.trim().length < MIN_QUESTION_LENGTH}
            >
              {busy ? <Spinner /> : <IconArrowUp />}
              <span className="sr-only">Ask</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
  )
}
