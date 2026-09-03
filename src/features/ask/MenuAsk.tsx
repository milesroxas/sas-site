'use client'

import { IconArrowDown, IconArrowUp, IconRefresh, IconX } from '@tabler/icons-react'
import type { ChatTransport, UIMessage } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  CHAT_EXIT_RELEASE_MS,
  CHAT_PANEL_EXIT_MS,
  CHAT_STAGE_DELAY_MS,
  CHAT_STAGE_DURATION_MS,
} from '@/Header/Menu/motion'
import { MenuPreviewSlot } from '@/Header/Menu/PreviewSlot'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'
import { errorText, TranscriptItems, transcriptItemEnter } from './messages'
import { useAskChat } from './useAskChat'

/**
 * The media-to-chat mask runs inside the docked frame (TakeoverMenu's
 * chat-view handler, `CHAT_WIPE_*`): the panel here sits beneath the frame's
 * z-index and is occluded until an opaque cover has wiped over the media and
 * the frame hides, a same-color switch to this panel, already fully drawn.
 * The panel never animates its entry; only its content stages in, and it
 * starts before the handoff under that occlusion (free motion: the content
 * is already drawn when the switch happens and the press settles sooner).
 * The exit mirrors it. The frame returns at once under the still-full cover,
 * the panel fades in place beneath it (`CHAT_PANEL_EXIT_MS`), and only then
 * is the column it borrowed on a phone released (`CHAT_EXIT_RELEASE_MS`), so
 * content leaves first and the nav returns into freed space.
 */
const panelContent = {
  open: 'translate-y-0 opacity-100 ease-[cubic-bezier(0.22,1,0.36,1)]',
  closed: 'translate-y-2 opacity-0 duration-150 ease-in',
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
   * Mobile only: the transcript claims the column the nav and CTA release,
   * but the panel has to stay coincident with the docked window until the
   * cover has painted that window's lower edge (the cover rises from that
   * edge, and the nav finishes yielding its space, on this same beat). The
   * exit holds the column while the panel fades and collapses on the release
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
    if (!open || reducedMotion) {
      setExpanded(false)
      return
    }
    const timer = window.setTimeout(() => setExpanded(false), CHAT_EXIT_RELEASE_MS)
    return () => window.clearTimeout(timer)
  }, [chatView, open, reducedMotion])

  const { question, setQuestion, messages, setMessages, status, error, busy, canSend, submit } =
    useAskChat({
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
      {/* The docked page frame lands exactly on this slot (measured by the
          menu's GSAP timeline); the transcript replaces it in place. */}
      <MenuPreviewSlot
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
            // exit fades in place (duration inline, from the chat-swap module):
            // the part under the window is occluded by the restored frame from
            // the first frame; the part below it, on a phone, fades against the
            // menu background before the column it borrowed is released.
            'motion-safe:transition-opacity motion-safe:ease-in',
            chatView ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transitionDuration: chatView ? '0ms' : `${CHAT_PANEL_EXIT_MS}ms` }}
        >
          {/* Header stages in alongside the transcript, landing at the wipe's
              end. The X steps back to the preview, the same exit the menu's
              Escape/backdrop layers trigger via exitChatViewRef. Title and
              description read one step up below `md` (16 / 14px, as the
              transcript body does): the registry's 14 / 12px is caption scale
              on a phone. */}
          <CardHeader
            className={cn(
              'border-b pt-(--card-spacing) motion-safe:transition-[opacity,translate]',
              chatView ? panelContent.open : panelContent.closed,
            )}
            style={panelContentStyle(chatView)}
          >
            <CardTitle className="text-base md:text-sm">Ask</CardTitle>
            <CardDescription className="text-sm/relaxed md:text-xs/relaxed">
              Answers about our work, services, and insights
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
                  <TranscriptItems messages={messages} pending={status === 'submitted'} />
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
        className="w-full self-center justify-self-center outline-none md:w-auto md:col-start-2 md:row-start-2"
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
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              className={composerButton}
              disabled={!canSend}
            >
              {busy ? (
                <Spinner className={composerIcon} />
              ) : (
                <IconArrowUp className={composerIcon} />
              )}
              <span className="sr-only">Ask</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
  )
}
