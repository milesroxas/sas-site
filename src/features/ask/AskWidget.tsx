'use client'

import type { ChatTransport, UIMessage } from 'ai'
import { useLenis } from 'lenis/react'
import { useCallback, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'
import { errorText, TranscriptItems, transcriptItemEnter } from './messages'
import { ASK_NOTICE } from './retention'
import { AskSubmitButton } from './SubmitButton'
import { useAskChat } from './useAskChat'

/** Breathing room kept under the composer after the reveal scroll (spacing 8). */
const COMPOSER_REVEAL_MARGIN = 32

type AskWidgetProps = {
  /**
   * Chat transport override — Storybook and tests inject a scripted transport
   * here; the real widget defaults to POSTing /api/ask.
   */
  transport?: ChatTransport<UIMessage>
  /** Seed the transcript, e.g. for stories or resuming a conversation. */
  initialMessages?: UIMessage[]
  /** Composer placeholder override, e.g. the footer closing band's shorter prompt. */
  placeholder?: string
}

export function AskWidget({
  transport,
  initialMessages,
  placeholder = 'Ask something about our work, services, or insights…',
}: AskWidgetProps) {
  const { question, setQuestion, messages, status, error, busy, canSend, submit, stop } =
    useAskChat({
      transport,
      initialMessages,
    })
  const hasTranscript = messages.length > 0

  /**
   * The transcript card grows in above the composer on the first send (the
   * `0fr → 1fr` track below), which can carry the composer below the fold.
   * Once the growth has settled, scroll by exactly the hidden amount, nearest
   * edge semantics, so a composer already in view never moves. Lenis is the
   * document's only scroll writer (docs/animations.md); without a root Lenis
   * (reduced motion, stories) the native scroll is the only writer anyway.
   */
  const lenis = useLenis()
  const reducedMotion = usePrefersReducedMotion()
  const formRef = useRef<HTMLFormElement>(null)
  const revealComposer = useCallback(() => {
    const form = formRef.current
    if (!form) return
    const hidden = form.getBoundingClientRect().bottom + COMPOSER_REVEAL_MARGIN - window.innerHeight
    if (hidden <= 0) return
    if (lenis) lenis.scrollTo(window.scrollY + hidden)
    else window.scrollBy({ top: hidden })
  }, [lenis])

  // Reduced motion has no track transition to wait for: reveal on the render
  // that first mounts the transcript. A seeded transcript (initialMessages)
  // is not a send and never scrolls.
  const wasEmpty = useRef(!hasTranscript)
  useEffect(() => {
    if (!hasTranscript) {
      wasEmpty.current = true
      return
    }
    if (wasEmpty.current && reducedMotion) revealComposer()
    wasEmpty.current = false
  }, [hasTranscript, reducedMotion, revealComposer])

  return (
    <div className="flex flex-col">
      {/* The transcript's row transitions from collapsed to content height, so
          the composer travels instead of teleporting on the first send. The
          card fades in alongside; it never slides, the growing clip is the
          motion. `data-lenis-prevent` hands wheel input to the transcript's
          own scroller instead of the page. */}
      <div
        className={cn(
          'grid motion-safe:transition-[grid-template-rows] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]',
          hasTranscript ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget || event.propertyName !== 'grid-template-rows')
            return
          revealComposer()
        }}
      >
        <div className="min-h-0 overflow-hidden">
          {hasTranscript && (
            <Card
              data-lenis-prevent
              className="mb-4 h-[min(60svh,32rem)] gap-0 py-0 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
            >
              <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
                <MessageScrollerProvider autoScroll>
                  <MessageScroller>
                    <MessageScrollerViewport>
                      <MessageScrollerContent className="p-(--card-spacing)">
                        <TranscriptItems messages={messages} status={status} />
                      </MessageScrollerContent>
                    </MessageScrollerViewport>
                    <MessageScrollerButton />
                  </MessageScroller>
                </MessageScrollerProvider>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className={`mb-4 text-destructive text-sm ${transcriptItemEnter}`}>
          {errorText(error)}
        </p>
      )}

      <form ref={formRef} onSubmit={submit}>
        <InputGroup>
          <InputGroupTextarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder={placeholder}
            maxLength={500}
            rows={2}
            required
          />
          <InputGroupAddon align="block-end">
            <AskSubmitButton busy={busy} canSend={canSend} onStop={stop} className="ml-auto" />
          </InputGroupAddon>
        </InputGroup>
        <p className="mt-3 text-muted-foreground text-xs/relaxed">{ASK_NOTICE}</p>
      </form>
    </div>
  )
}
