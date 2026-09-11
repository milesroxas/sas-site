'use client'

import { IconX } from '@tabler/icons-react'
import type { ChatTransport } from 'ai'
import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import type { AskUIMessage } from '@/features/ask/handoff'
import { errorText, TranscriptItems, transcriptItemEnter } from '@/features/ask/messages'
import { AskSubmitButton } from '@/features/ask/SubmitButton'
import { useAskChat } from '@/features/ask/useAskChat'
import { leakExcite } from '@/features/immersive'
import type { Footer } from '@/payload-types'
import { cn } from '@/utilities/ui'

const suggestions = ['How do we start?', 'What does it cost?', 'Who have you worked with?']

type ClosingAskProps = {
  ask?: NonNullable<Footer['closing']>['ask']
  transport?: ChatTransport<AskUIMessage>
  initialMessages?: AskUIMessage[]
}

export function ClosingAsk({ ask, transport, initialMessages }: ClosingAskProps) {
  const [open, setOpen] = useState(Boolean(initialMessages?.length))
  const [keyboard, setKeyboard] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelId = useId()
  const {
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
  } = useAskChat({ transport, initialMessages, onSend: () => setOpen(true) })
  const title = ask?.title || 'Ask us anything.'
  const body = ask?.body || 'Work, process, pricing, fit. Answered in seconds.'

  function close() {
    setOpen(false)
    inputRef.current?.focus({ preventScroll: true })
  }

  const intro = (
    <div className="flex flex-col gap-2">
      <p className="text-lg/6.5">{title}</p>
      <p className="text-sm/5.5 text-muted-foreground">{body}</p>
    </div>
  )

  return (
    <div
      className="relative min-w-0"
      {...leakExcite()}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDownCapture={(event) => {
        setKeyboard(true)
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          event.stopPropagation()
          close()
        }
      }}
    >
      {/* The panel outgrows the card (min 30rem, bottom-anchored), so its ring
          is the only edge while it is open: the card's own ring would stack
          under it from the card's top edge down (a brighter run of line, with
          the card's corner arc showing at the seam). It fades on the panel's
          timing so the two edges hand over instead of popping. */}
      <Card
        className={cn(
          'relative gap-12 overflow-visible bg-card/75 backdrop-blur-md [--card-spacing:--spacing(6)]',
          'transition-shadow ease-[cubic-bezier(0.19,1,0.22,1)]',
          open ? 'ring-transparent duration-250' : 'duration-150',
          keyboard && 'transition-none',
        )}
      >
        {/* Opening lifts the intro out (up, fading, lightly blurred) while the
            compact header rides in on the panel from below: one directional
            crossfade, so the big intro reads as condensing into the header
            rather than being covered. Exit is quicker than the panel's entry;
            closing reverses it along the same path. */}
        <div
          inert={open}
          className={cn(
            'flex flex-col gap-12 px-6',
            'transition-[opacity,translate,filter] motion-reduce:transition-opacity',
            open
              ? 'opacity-0 -translate-y-1 blur-[2px] duration-150 ease-out motion-reduce:translate-y-0 motion-reduce:blur-none'
              : 'opacity-100 translate-y-0 blur-none duration-250 ease-[cubic-bezier(0.19,1,0.22,1)]',
            keyboard && 'transition-none',
          )}
        >
          {intro}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="chat"
                className="font-normal motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)] pointer-fine:active:scale-[0.97] motion-reduce:transform-none"
                aria-controls={panelId}
                aria-expanded={open}
                disabled={busy}
                onClick={() => {
                  sendQuestion(suggestion)
                  inputRef.current?.focus({ preventScroll: true })
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* One composer stays in place through both states, preserving focus and drafts. */}
        <form onSubmit={submit} className="relative z-20 px-6">
          <InputGroup>
            <InputGroupTextarea
              ref={inputRef}
              aria-label="Ask a question"
              aria-controls={panelId}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              placeholder="Ask anything…"
              maxLength={500}
              rows={2}
              required
              className="min-h-14 text-base md:text-xs"
            />
            <InputGroupAddon align="block-end">
              {messages.length > 0 && !open ? (
                <Button
                  type="button"
                  variant="ghost"
                  // Lands after the panel's 150ms exit so one thing leaves,
                  // then one thing arrives. Arbitrary animation-delay on
                  // purpose: the `delay-*` utility also sets transition-delay
                  // here, which would hold back `pressable`'s press feedback.
                  className="text-xs motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:fill-mode-backwards motion-safe:[animation-delay:150ms]"
                  onClick={() => {
                    setOpen(true)
                    inputRef.current?.focus({ preventScroll: true })
                  }}
                >
                  Resume conversation
                </Button>
              ) : null}
              <AskSubmitButton
                busy={busy}
                canSend={canSend}
                onStop={stop}
                className="relative ml-auto size-11 md:size-6 md:after:absolute md:after:-inset-2.5"
              />
            </InputGroupAddon>
          </InputGroup>
        </form>

        <section
          id={panelId}
          aria-label="Ask Suits & Sandals conversation"
          inert={!open}
          data-lenis-prevent
          className={cn(
            'absolute inset-x-0 bottom-0 z-10 flex h-[max(30rem,100%)] origin-bottom flex-col gap-4 overflow-hidden rounded-lg bg-popover pb-40 pt-4 text-popover-foreground shadow-[0_32px_64px_-16px_#0a0a0a38] ring-1 ring-foreground/10 md:pb-36',
            'transition-[transform,opacity,visibility] ease-[cubic-bezier(0.19,1,0.22,1)]',
            open
              ? 'visible transform-none opacity-100 duration-250'
              : 'invisible transform-[translateY(8px)_scale(0.98)] opacity-0 duration-150',
            'motion-reduce:transform-none',
            keyboard && 'transition-none',
          )}
        >
          {/* Compact chat header: the intro's stand-in once messages begin,
              sized so the transcript, not the chrome, owns the panel. */}
          <div className="flex shrink-0 items-center gap-2.5 border-b px-6 pb-4">
            <div
              aria-hidden
              className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
            >
              S&S
              <span className="absolute -right-px -bottom-px size-2.5 rounded-full border-2 border-popover bg-active" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm/tight font-medium">Ask Suits &amp; Sandals</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="relative size-8 rounded-full after:absolute after:-inset-1.5"
              aria-label="Close conversation"
              onClick={close}
            >
              <IconX className="size-3.5" />
            </Button>
          </div>
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport>
                {/* Every direct child of the log is an Item so the scroller can
                    measure, anchor, and track it; a short transcript sits at the
                    composer end of the viewport rather than the header. */}
                <MessageScrollerContent className="justify-end gap-4 px-6">
                  <TranscriptItems messages={messages} status={status} />
                  {error ? (
                    <MessageScrollerItem messageId="error">
                      <p role="alert" className={`text-sm text-destructive ${transcriptItemEnter}`}>
                        {errorText(error)}
                      </p>
                    </MessageScrollerItem>
                  ) : null}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </section>
      </Card>
    </div>
  )
}
