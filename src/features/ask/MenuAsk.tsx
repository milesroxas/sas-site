'use client'

import { IconArrowUp, IconRefresh, IconX } from '@tabler/icons-react'
import type { ChatTransport, UIMessage } from 'ai'
import { useEffect, useState } from 'react'
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
import { CHAT_STAGE_DELAY_MS, CHAT_STAGE_DURATION_MS } from '@/Header/Menu/motion'
import { cn } from '@/utilities/ui'
import { errorText, TranscriptItems, transcriptItemEnter } from './messages'
import { useAskChat } from './useAskChat'

/**
 * The media→chat mask runs *inside* the docked frame (TakeoverMenu's
 * chat-view handler, `CHAT_WIPE_*`): the panel here sits beneath the frame's
 * z-index and is occluded until an opaque cover has wiped over the media and
 * the frame hides — a same-color switch to this panel, already fully drawn.
 * The panel never animates itself; only its content stages in, and it starts
 * before the handoff under that occlusion — free motion, so the content is
 * already drawn when the switch happens and the press settles sooner.
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

type MenuAskProps = {
  /** Takeover-menu open state — closing the menu returns to the preview view. */
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
   * Mobile only: the transcript claims the column the nav and CTA release, but
   * the panel has to stay coincident with the docked window until the cover has
   * painted that window's lower edge — the cover rises from that edge, and the
   * nav finishes yielding its space, on this same beat.
   */
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (!chatView) {
      setExpanded(false)
      return
    }
    const timer = window.setTimeout(() => setExpanded(true), CHAT_STAGE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [chatView])

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
    // A cleared transcript has nothing to show — hand the window back to the
    // preview in the same gesture so the panel exits instead of emptying.
    setMessages([])
    setChatView(false)
  }

  return (
    <>
      {/* The docked page frame lands exactly on this slot (measured by the
          menu's GSAP timeline); the transcript replaces it in place. */}
      <div
        data-menu-preview-slot
        className={cn(
          'pointer-events-none relative aspect-video w-full md:col-start-2 md:row-start-1 md:aspect-auto md:h-full md:min-h-0',
          // Mobile chat view grows the 16:9 preview box into the column the nav
          // and CTA release, so the transcript reads as a full chat surface and
          // not a letterboxed strip. It must not grow before the wipe has
          // painted the docked window's lower edge: the frame paints only its
          // clipped box, so panel sticking out below shows against the menu
          // background. Collapse is instant — the panel's opacity snaps off in
          // the same commit, so there is nothing left to animate back.
          'max-md:min-h-0 max-md:transition-[flex-grow] max-md:ease-out',
          expanded ? 'max-md:grow max-md:duration-300' : 'max-md:duration-0',
        )}
      >
        {/* Always mounted and fully drawn beneath the docked frame — the
            frame's wipe hands over to it invisibly (same color, same
            geometry). Radius matches the dock's card (20px mobile / 24px
            desktop) so the switch doesn't pop at the corners. */}
        <section
          aria-label="Ask transcript"
          data-lenis-prevent
          inert={!chatView}
          className={cn(
            'bg-popover text-popover-foreground shadow-2xl pointer-events-auto absolute inset-0 flex flex-col overflow-hidden rounded-[20px] md:rounded-3xl [--card-spacing:--spacing(4)]',
            // No transition — the frame occludes this panel until the
            // handoff; opacity only guards against mis-stacking while idle.
            chatView ? 'opacity-100' : 'opacity-0',
          )}
        >
          {/* Header stages in alongside the transcript, landing at the wipe's
              end. The X steps back to the preview — the same exit the menu's
              Escape/backdrop layers trigger via exitChatViewRef. */}
          <CardHeader
            className={cn(
              'border-b pt-(--card-spacing) motion-safe:transition-[opacity,translate]',
              chatView ? panelContent.open : panelContent.closed,
            )}
            style={panelContentStyle(chatView)}
          >
            <CardTitle>Ask</CardTitle>
            <CardDescription>Answers about our work, services, and insights</CardDescription>
            <CardAction className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="New conversation"
                onClick={resetConversation}
                disabled={busy}
              >
                <IconRefresh />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Back to menu"
                onClick={hideTranscript}
              >
                <IconX />
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
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </section>
      </div>

      <form
        data-menu-item
        className="w-full self-center justify-self-center md:w-auto md:col-start-2 md:row-start-2"
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
            placeholder="Ask anything…"
            maxLength={500}
            required
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              // Comfortable thumb target inside the h-12 pill; compact on desktop.
              className="size-9 md:size-7"
              disabled={!canSend}
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
