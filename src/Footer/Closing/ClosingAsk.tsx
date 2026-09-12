'use client'

import { IconX } from '@tabler/icons-react'
import type { ChatTransport } from 'ai'
import { type Ref, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { AskTextarea } from '@/features/ask/Composer'
import {
  ASK_HANDOFF_TERMS_FALLBACK,
  type AskHandoffTerms,
  type AskUIMessage,
} from '@/features/ask/handoff'
import { errorText, TranscriptItems } from '@/features/ask/messages'
import { transcriptItemEnter } from '@/features/ask/motion'
import { AskSubmitButton, askComposerButton, askComposerIcon } from '@/features/ask/SubmitButton'
import { useAskChat } from '@/features/ask/useAskChat'
import { leakExcite } from '@/features/immersive'
import { focusForKeyboard, trackInputModality } from '@/Header/Menu/focus'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Footer } from '@/payload-types'
import { cn } from '@/utilities/ui'

const suggestions = ['How do we start?', 'What does it cost?', 'Who have you worked with?']

type ClosingAskProps = {
  ask?: NonNullable<Footer['closing']>['ask']
  transport?: ChatTransport<AskUIMessage>
  initialMessages?: AskUIMessage[]
  /** Site Info's reply promise, for the handoff under a finished answer. */
  terms?: AskHandoffTerms
}

/**
 * The closing band's Ask. From `md` the conversation opens as a panel over
 * the card, bottom-anchored behind the one composer, so the band's copy
 * never moves. On a phone that panel was a box in a box in a box, with a
 * page heading peeking over its top edge and room for one exchange above
 * the keyboard, so there the conversation takes the whole screen instead: a
 * sheet with its own composer docked at the bottom. Both read the same chat,
 * the same draft, and the same handoff state, so a visitor who rotates the
 * phone mid-conversation loses nothing.
 */
export function ClosingAsk({
  ask,
  transport,
  initialMessages,
  terms = ASK_HANDOFF_TERMS_FALLBACK,
}: ClosingAskProps) {
  const [open, setOpen] = useState(Boolean(initialMessages?.length))
  const [keyboard, setKeyboard] = useState(false)
  const mobile = useIsMobile()
  const cardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
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
    sent,
    markSent,
    feedback,
  } = useAskChat({ transport, initialMessages, onSend: () => setOpen(true) })

  useEffect(() => trackInputModality(), [])

  /**
   * The transcript panel is bottom-anchored behind the composer, so it keeps
   * the composer's footprint clear with bottom padding. That reserve is the
   * composer's measured height plus the card's padding under it, written as
   * a variable the panel reads, rather than a padding utility picked to look
   * right: the one-line composer grows with a long draft (`field-sizing`),
   * and a guessed reserve either covered the last lines of the conversation
   * or wasted half the panel on air. Offsets, not client rects: the page
   * frame is scaled while the menu is docked, and a rect read then would bake
   * that scale in.
   */
  useLayoutEffect(() => {
    const card = cardRef.current
    const form = formRef.current
    if (!card || !form) return
    const measure = () => {
      card.style.setProperty('--composer-reserve', `${card.offsetHeight - form.offsetTop}px`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(form)
    return () => observer.disconnect()
  }, [])
  const title = ask?.title || 'Ask us anything.'
  const body = ask?.body || 'Work, process, pricing, fit. Answered in seconds.'
  /** The in-card panel is up; on a phone the sheet covers the card instead and the card stays as it was. */
  const panelOpen = open && !mobile

  /**
   * Back to the card. Focus returns to the composer only for a keyboard
   * user: a finger closing the sheet must not be handed a raised keyboard.
   */
  function close() {
    setOpen(false)
    focusForKeyboard(inputRef.current, { preventScroll: true })
  }

  /** A pointer on a desktop lands in the composer to keep typing; on a phone the sheet is the next thing to read. */
  function focusComposer() {
    if (!mobile) inputRef.current?.focus({ preventScroll: true })
  }

  const intro = (
    <div className="flex flex-col gap-2">
      <p className="text-lg/6.5">{title}</p>
      <p className="text-sm/5.5 text-muted-foreground">{body}</p>
    </div>
  )

  const transcript = (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          {/* Every direct child of the log is an Item so the scroller can
              measure, anchor, and track it; a short transcript sits at the
              composer end of the viewport rather than the header. */}
          <MessageScrollerContent className="justify-end gap-4 px-6">
            <TranscriptItems
              feedback={feedback}
              messages={messages}
              onSent={markSent}
              sent={sent}
              status={status}
              terms={terms}
            />
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
  )

  /**
   * One composer definition for the card and the sheet: one line with the
   * send button beside it, as the menu's pill; a long draft grows the line
   * (the textarea sizes to its content once `min-h-0` lifts the boxed
   * textarea's minimum), so the conversation, not an empty box, owns the
   * surface. Both bind the same draft, so nothing typed is lost between them.
   */
  const composer = (ref: Ref<HTMLTextAreaElement>, before?: React.ReactNode) => (
    <InputGroup>
      <AskTextarea
        ref={ref}
        aria-label="Ask a question"
        aria-controls={ref === inputRef && !mobile ? panelId : undefined}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ask anything…"
        className="min-h-0 text-base md:text-xs"
      />
      <InputGroupAddon align="inline-end">
        {before}
        <AskSubmitButton
          busy={busy}
          canSend={canSend}
          onStop={stop}
          className={askComposerButton}
          iconClassName={askComposerIcon}
        />
      </InputGroupAddon>
    </InputGroup>
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
        ref={cardRef}
        className={cn(
          'relative gap-12 overflow-visible bg-card/75 backdrop-blur-md [--card-spacing:--spacing(6)] [--composer-reserve:--spacing(16)]',
          'transition-shadow ease-[cubic-bezier(0.19,1,0.22,1)]',
          panelOpen ? 'ring-transparent duration-250' : 'duration-150',
          keyboard && 'transition-none',
        )}
      >
        {/* Opening lifts the intro out (up, fading, lightly blurred) while the
            compact header rides in on the panel from below: one directional
            crossfade, so the big intro reads as condensing into the header
            rather than being covered. Exit is quicker than the panel's entry;
            closing reverses it along the same path. The sheet covers the
            card, so on a phone the intro stays put beneath it. */}
        <div
          inert={panelOpen}
          className={cn(
            'flex flex-col gap-12 px-6',
            'transition-[opacity,translate,filter] motion-reduce:transition-opacity',
            panelOpen
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
                aria-controls={mobile ? undefined : panelId}
                aria-expanded={open}
                disabled={busy}
                onClick={() => {
                  sendQuestion(suggestion)
                  focusComposer()
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* The card's composer stays in place through both states, preserving focus and drafts. */}
        <form ref={formRef} onSubmit={submit} className="relative z-20 px-6">
          {composer(
            inputRef,
            messages.length > 0 && !open ? (
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
                  focusComposer()
                }}
              >
                Resume conversation
              </Button>
            ) : null,
          )}
        </form>

        {mobile ? (
          <ClosingAskSheet
            onClose={close}
            open={open}
            typingIn={inputRef}
            composer={composer}
            onSubmit={submit}
          >
            {transcript}
          </ClosingAskSheet>
        ) : (
          <section
            id={panelId}
            aria-label="Ask Suits & Sandals conversation"
            inert={!open}
            data-lenis-prevent
            className={cn(
              // Bottom padding is the composer's measured reserve (see the
              // layout effect above) plus one step of air over it.
              'absolute inset-x-0 bottom-0 z-10 flex h-[max(30rem,100%)] origin-bottom flex-col gap-4 overflow-hidden rounded-lg bg-popover pb-[calc(var(--composer-reserve)+(--spacing(4)))] pt-4 text-popover-foreground shadow-[0_32px_64px_-16px_#0a0a0a38] ring-1 ring-foreground/10',
              'transition-[transform,opacity,visibility] ease-[cubic-bezier(0.19,1,0.22,1)]',
              open
                ? 'visible transform-none opacity-100 duration-250'
                : 'invisible transform-[translateY(8px)_scale(0.98)] opacity-0 duration-150',
              'motion-reduce:transform-none',
              keyboard && 'transition-none',
            )}
          >
            <ChatHeader onClose={close} />
            {transcript}
          </section>
        )}
      </Card>
    </div>
  )
}

/**
 * The phone's conversation surface: the whole screen, the transcript between
 * a compact header and a composer docked at the bottom. A visitor who sent
 * from the keyboard keeps it (the sheet's composer takes over); anyone else
 * lands on the sheet itself, never on a field that would raise a keyboard
 * unasked. Closing hands focus to nobody: the card decides.
 */
function ClosingAskSheet({
  open,
  onClose,
  typingIn,
  composer,
  onSubmit,
  children,
}: {
  open: boolean
  onClose: () => void
  /** The card's own text box: focus there at open means the visitor is typing. */
  typingIn: React.RefObject<HTMLTextAreaElement | null>
  composer: (ref: Ref<HTMLTextAreaElement>) => React.ReactNode
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        ref={sheetRef}
        side="bottom"
        showCloseButton={false}
        data-lenis-prevent
        aria-describedby={undefined}
        className="gap-0 border-t-0 text-base data-[side=bottom]:h-dvh"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const typing = document.activeElement === typingIn.current
          ;(typing ? inputRef.current : sheetRef.current)?.focus({ preventScroll: true })
        }}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <ChatHeader
          as={SheetTitle}
          className="pt-[max(1rem,env(safe-area-inset-top))]"
          onClose={onClose}
        />
        {children}
        <form
          onSubmit={onSubmit}
          className="border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          {composer(inputRef)}
        </form>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Compact chat header: the intro's stand-in once messages begin, sized so
 * the transcript, not the chrome, owns the surface. `as` lets the sheet
 * make the title its accessible name.
 */
function ChatHeader({
  as: Title = 'p',
  className,
  onClose,
}: {
  as?: React.ElementType<{ className?: string; children?: React.ReactNode }>
  className?: string
  onClose: () => void
}) {
  return (
    <div className={cn('flex shrink-0 items-center gap-2.5 border-b px-6 pb-4', className)}>
      <div
        aria-hidden
        className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
      >
        S&S
        <span className="absolute -right-px -bottom-px size-2.5 rounded-full border-2 border-popover bg-active" />
      </div>
      <div className="min-w-0 flex-1">
        <Title className="text-sm/tight font-medium">Ask Suits &amp; Sandals</Title>
        <p className="text-xs text-muted-foreground">Online</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="relative size-8 rounded-full after:absolute after:-inset-1.5"
        aria-label="Close conversation"
        onClick={onClose}
      >
        <IconX className="size-3.5" />
      </Button>
    </div>
  )
}
