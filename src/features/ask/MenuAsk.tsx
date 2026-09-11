'use client'

import { IconArrowDown, IconRefresh, IconX } from '@tabler/icons-react'
import type { ChatTransport, UIMessage } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import {
  CHAT_EXIT_RELEASE_MS,
  CHAT_PANEL_EXIT_MS,
  CHAT_STAGE_DELAY_MS,
  CHAT_STAGE_DURATION_MS,
  CHAT_WINDOW_RESIZE_MS,
  isDesktop,
} from '@/Header/Menu/motion'
import { MenuPreviewSlot } from '@/Header/Menu/PreviewSlot'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'
import { errorText, TranscriptItems, transcriptItemEnter } from './messages'
import { ASK_NOTICE } from './retention'
import { AskSubmitButton } from './SubmitButton'
import { useAskChat } from './useAskChat'

/**
 * The media-to-chat mask runs inside the docked frame (TakeoverMenu's
 * chat-view handler, `CHAT_WIPE_*`): the panel here sits beneath the frame's
 * z-index and is occluded until an opaque cover has wiped over the media and
 * the frame hides, a same-color switch to this panel, already fully drawn.
 * The panel never animates its entry; its content arrives on the handoff
 * frame, the first frame it can be seen, and rises from the composer's edge
 * as the wipe's continuation (CHAT_STAGE_*).
 * The exit mirrors it. On desktop the window shrinks back to 16:9 in view
 * (`CHAT_WINDOW_RESIZE_MS`, center-origin: the slot centers it), the panel
 * still opaque, and the frame returns under the cover only once it lands,
 * so the panel switches off unseen. On a phone the frame returns at once,
 * the panel fades in place beneath it (`CHAT_PANEL_EXIT_MS`), and only then
 * is the column it borrowed released (`CHAT_EXIT_RELEASE_MS`), so content
 * leaves first and the nav returns into freed space.
 */

/**
 * Content arrival. The transcript rises from the composer's direction; the
 * header fades in place (it sits where the wipe just landed, and chrome is
 * the least important thing on the surface, so it gets the least motion).
 * Both share one start (the handoff frame) and one curve so they read as a
 * single beat. Exits keep the shorter 150ms ease-in the rest of the swap's
 * exit uses.
 */
const panelContent = {
  open: 'translate-y-0 opacity-100 ease-[cubic-bezier(0.22,1,0.36,1)]',
  closed: 'translate-y-2 opacity-0 duration-150 ease-in',
}
const panelChrome = {
  open: 'opacity-100 ease-[cubic-bezier(0.22,1,0.36,1)]',
  closed: 'opacity-0 duration-150 ease-in',
}

/**
 * Open-state timing comes from the menu's chat-swap module, never from a
 * Tailwind arbitrary value: the delay has to agree with a GSAP wipe that lives
 * there, and a restated number desyncs silently the moment the wipe is
 * retuned. Inline style because Tailwind cannot see a runtime constant.
 */
const panelContentStyle = (chatView: boolean): React.CSSProperties =>
  chatView
    ? {
        transitionDuration: `${CHAT_STAGE_DURATION_MS}ms`,
        transitionDelay: `${CHAT_STAGE_DELAY_MS}ms`,
      }
    : {}

/**
 * Touch sizing (Apple HIG: 44pt minimum target, toolbar glyphs around 20pt).
 * Below `md` every control on this surface is a real 44px box with a 20px
 * glyph; from `md`, where the pointer is fine, the compact registry sizes
 * return. The ghost fill is invisible at rest, so a 44px box reads as its
 * glyph alone: `iconActions` pulls the boxes into the header's padding by the
 * 12px of slack around a glyph, so the glyph, not the box, sits on the edge.
 */
const touchIconButton = 'size-11 md:size-6'
const touchIcon = 'size-5 md:size-3'
const iconActions = '-mr-3 flex gap-1 self-center md:mr-0 md:self-start'
/**
 * Composer submit: a 40px disc inside the 48px pill (the Messages proportion),
 * padded by `::after` out to the pill's full height so the target is 48px
 * without the disc filling the capsule. Compact from `md`.
 */
const composerButton = 'relative size-10 after:absolute after:-inset-1 md:size-7 md:after:hidden'
const composerIcon = 'size-5 md:size-3.5'

type MenuAskProps = {
  /** Takeover-menu open state: closing the menu returns to the preview view. */
  open: boolean
  /**
   * Fires when the transcript takes over / releases the preview window, so the
   * menu's mobile layout can hand the nav's space to the transcript.
   */
  onViewChange?: (chatView: boolean) => void
  /**
   * Parent-owned ref this component fills with its "step back to the preview"
   * action, so the menu's dismissal layers (Escape, backdrop clicks) can exit
   * the transcript without closing the whole menu. Runs the same unwipe as
   * the in-panel close button.
   */
  exitChatViewRef?: React.RefObject<(() => void) | null>
  /** Transport override for stories/tests, same seam as AskWidget. */
  transport?: ChatTransport<UIMessage>
  initialMessages?: UIMessage[]
}

/**
 * The takeover menu's Ask surface: a floating pill composer under the page
 * preview. Submitting swaps the preview window for the transcript panel via
 * the `panelMask` clip-path wipe above.
 */
export function MenuAsk({
  open,
  onViewChange,
  exitChatViewRef,
  transport,
  initialMessages,
}: MenuAskProps) {
  const [chatView, setChatView] = useState(false)
  const showTranscript = () => setChatView(true)
  const hideTranscript = () => setChatView(false)

  /**
   * Exit from inside the panel (the X, a reset). The panel goes inert under
   * the pressed button, which would drop focus to <body>; park it on the
   * composer instead, the surface the transcript came from, without focusing
   * the input itself: on a phone that raises the software keyboard.
   */
  const formRef = useRef<HTMLFormElement>(null)
  const leaveTranscript = () => {
    hideTranscript()
    formRef.current?.focus({ preventScroll: true })
  }

  /**
   * The transcript claims more than the preview window (the column the nav
   * and CTA release on a phone, the rest of the slot on desktop), but the
   * panel has to stay coincident with the docked window until the
   * cover has painted that window's lower edge (the cover rises from that
   * edge, and the nav finishes yielding its space, on this same beat). The
   * desktop exit drops it at once: the shrink is the visible half of the
   * exit (PreviewSlot animates it, the menu waits for it). The phone exit
   * holds the column while the panel fades and collapses on the release
   * beat, when nothing is left to see. Closing the whole menu collapses at
   * once, under the menu's own close fade; reduced motion has no wipe or
   * fade to wait for, so both directions flip immediately.
   */
  const reducedMotion = usePrefersReducedMotion()
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (chatView) {
      if (reducedMotion) {
        setExpanded(true)
        return
      }
      const timer = window.setTimeout(() => setExpanded(true), CHAT_STAGE_DELAY_MS)
      return () => window.clearTimeout(timer)
    }
    if (!open || reducedMotion || isDesktop()) {
      setExpanded(false)
      return
    }
    const timer = window.setTimeout(() => setExpanded(false), CHAT_EXIT_RELEASE_MS)
    return () => window.clearTimeout(timer)
  }, [chatView, open, reducedMotion])

  const {
    question,
    setQuestion,
    messages,
    setMessages,
    status,
    error,
    busy,
    canSend,
    submit,
    stop,
  } = useAskChat({
    transport,
    initialMessages,
    // Submitting swaps the preview window for the transcript panel.
    onSend: showTranscript,
  })

  // Closing the menu hands the window back to the page preview.
  useEffect(() => {
    if (!open) setChatView(false)
  }, [open])

  useEffect(() => {
    onViewChange?.(chatView)
  }, [chatView, onViewChange])

  // Hand the exit action to the menu so its Escape/backdrop layers can use it.
  useEffect(() => {
    if (!exitChatViewRef) return
    exitChatViewRef.current = hideTranscript
    return () => {
      exitChatViewRef.current = null
    }
  })

  const resetConversation = () => {
    // A cleared transcript has nothing to show: hand the window back to the
    // preview in the same gesture so the panel exits instead of emptying.
    setMessages([])
    leaveTranscript()
  }

  return (
    <>
      {/* The docked page frame lands exactly on the slot's window (measured
          by the menu's GSAP timeline); the transcript replaces it in place.
          On desktop `expanded` grows the window out of its 16:9 box to fill
          the slot, on the same beat as the mobile grow below. */}
      <MenuPreviewSlot
        expanded={expanded}
        className={cn(
          // Mobile chat view grows the 16:9 preview box into the column the nav
          // and CTA release, so the transcript reads as a full chat surface and
          // not a letterboxed strip. It must not grow before the wipe has
          // painted the docked window's lower edge: the frame paints only its
          // clipped box, so panel sticking out below shows against the menu
          // background. Collapse is instant, on the exit's release beat: the
          // panel has faded by then, so there is nothing left to animate back.
          'max-md:min-h-0 max-md:ease-out max-md:motion-safe:transition-[flex-grow]',
          expanded ? 'max-md:grow max-md:duration-300' : 'max-md:duration-0',
        )}
      >
        {/* Always mounted and fully drawn beneath the docked frame: the
            frame's wipe hands over to it invisibly (same color, same
            geometry). Radius matches the dock's card (20px mobile / 24px
            desktop) so the switch doesn't pop at the corners. */}
        <section
          aria-label="Ask transcript"
          data-lenis-prevent
          inert={!chatView}
          className={cn(
            'bg-popover text-popover-foreground shadow-2xl pointer-events-auto absolute inset-0 flex flex-col overflow-hidden rounded-[20px] md:rounded-3xl [--card-spacing:--spacing(4)]',
            // Entry has no transition: the frame occludes this panel until the
            // handoff, and it must be fully drawn when the switch happens. The
            // exit timing comes from the chat-swap module (custom properties
            // below). Desktop: the panel stays opaque while the window shrinks
            // and switches off on the frame's return, occluded. Phone: it fades
            // in place; the part under the window is occluded by the restored
            // frame from the first frame, the part below it fades against the
            // menu background before the column it borrowed is released.
            'motion-safe:transition-opacity motion-safe:ease-in',
            chatView
              ? 'opacity-100 duration-0'
              : 'opacity-0 max-md:duration-(--chat-panel-exit) md:delay-(--chat-window-resize) md:duration-0',
          )}
          style={
            {
              '--chat-panel-exit': `${CHAT_PANEL_EXIT_MS}ms`,
              '--chat-window-resize': `${CHAT_WINDOW_RESIZE_MS}ms`,
            } as React.CSSProperties
          }
        >
          {/* Header fades in place on the handoff beat while the transcript
              rises. The X steps back to the preview, the same exit the menu's
              Escape/backdrop layers trigger via exitChatViewRef. Title and
              description read one step up below `md` (16 / 14px, as the
              transcript body does): the registry's 14 / 12px is caption scale
              on a phone. */}
          <CardHeader
            className={cn(
              'border-b pt-(--card-spacing) motion-safe:transition-opacity',
              chatView ? panelChrome.open : panelChrome.closed,
            )}
            style={panelContentStyle(chatView)}
          >
            <CardTitle className="text-base md:text-sm">Ask</CardTitle>
            <CardDescription className="text-sm/relaxed md:text-xs/relaxed">
              {ASK_NOTICE}
            </CardDescription>
            <CardAction className={iconActions}>
              <Button
                variant="ghost"
                size="icon-sm"
                className={touchIconButton}
                aria-label="New conversation"
                onClick={resetConversation}
                disabled={busy}
              >
                <IconRefresh className={touchIcon} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={touchIconButton}
                aria-label="Back to menu"
                onClick={leaveTranscript}
              >
                <IconX className={touchIcon} />
              </Button>
            </CardAction>
          </CardHeader>
          <MessageScrollerProvider autoScroll>
            <MessageScroller
              className={cn(
                'min-h-0 flex-1 motion-safe:transition-[opacity,translate]',
                chatView ? panelContent.open : panelContent.closed,
              )}
              style={panelContentStyle(chatView)}
            >
              <MessageScrollerViewport className="overscroll-contain">
                <MessageScrollerContent className="p-4">
                  <TranscriptItems messages={messages} status={status} />
                  {error && (
                    <MessageScrollerItem messageId="error">
                      <p
                        className={`text-destructive text-sm/relaxed md:text-xs/relaxed ${transcriptItemEnter}`}
                      >
                        {errorText(error)}
                      </p>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton
                render={<Button variant="secondary" size="icon-sm" className={touchIconButton} />}
              >
                <IconArrowDown className={touchIcon} />
                <span className="sr-only">Scroll to end</span>
              </MessageScrollerButton>
            </MessageScroller>
          </MessageScrollerProvider>
        </section>
      </MenuPreviewSlot>

      <form
        ref={formRef}
        // Focusable, not tabbable: `leaveTranscript` parks focus here.
        tabIndex={-1}
        data-menu-item
        className="w-full self-center outline-none md:w-auto"
        onSubmit={submit}
      >
        <InputGroup variant="pill">
          <InputGroupInput
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onFocus={() => {
              // Returning to a running conversation brings the transcript back.
              if (messages.length > 0) showTranscript()
            }}
            aria-label="Ask a question"
            placeholder="Ask anything…"
            enterKeyHint="send"
            autoComplete="off"
            maxLength={500}
            required
          />
          <InputGroupAddon align="inline-end">
            <AskSubmitButton
              busy={busy}
              canSend={canSend}
              onStop={stop}
              className={composerButton}
              iconClassName={composerIcon}
            />
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
  )
}
