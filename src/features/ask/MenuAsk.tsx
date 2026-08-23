'use client'

import { IconArrowUp } from '@tabler/icons-react'
import type { ChatTransport, UIMessage } from 'ai'
import { useEffect, useState } from 'react'
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
import { cn } from '@/utilities/ui'
import { errorText, TranscriptItems, transcriptItemEnter } from './messages'
import { useAskChat } from './useAskChat'

/**
 * The media→chat mask runs *inside* the docked frame (TakeoverMenu's
 * chat-view handler, `CHAT_WIPE_*`): the panel here sits beneath the frame's
 * z-index and is occluded until an opaque cover has wiped over the media and
 * the frame hides — a same-color switch to this panel, already fully drawn.
 * The panel never animates itself; only its content stages in, delayed to
 * land exactly at that 340ms handoff.
 */
const panelContent = {
  open: 'translate-y-0 opacity-100 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [transition-delay:340ms]',
  closed: 'translate-y-2 opacity-0 duration-150 ease-in [transition-delay:0ms]',
}

type MenuAskProps = {
  /** Takeover-menu open state — closing the menu returns to the preview view. */
  open: boolean
  /**
   * Fires when the transcript takes over / releases the preview window, so the
   * menu's mobile layout can hand the nav's space to the transcript.
   */
  onViewChange?: (chatView: boolean) => void
  /** Transport override for stories/tests, same seam as AskWidget. */
  transport?: ChatTransport<UIMessage>
  initialMessages?: UIMessage[]
}

/**
 * The takeover menu's Ask surface: a floating pill composer under the page
 * preview. Submitting swaps the preview window for the transcript panel via
 * the `panelMask` clip-path wipe above.
 */
export function MenuAsk({ open, onViewChange, transport, initialMessages }: MenuAskProps) {
  const [chatView, setChatView] = useState(false)
  const showTranscript = () => setChatView(true)

  const { question, setQuestion, messages, status, error, busy, canSend, submit } = useAskChat({
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

  return (
    <>
      {/* The docked page frame lands exactly on this slot (measured by the
          menu's GSAP timeline); the transcript replaces it in place. */}
      <div
        data-menu-preview-slot
        className={cn(
          'pointer-events-none relative w-full md:col-start-2 md:row-start-1 md:aspect-auto md:h-full md:min-h-0',
          // Mobile chat view drops the 16:9 preview ratio and takes the free
          // column height (the menu hides nav + CTA underneath) so the
          // transcript reads as a full chat surface, not a letterboxed strip.
          chatView ? 'min-h-0 flex-1' : 'aspect-video',
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
            'bg-popover text-popover-foreground shadow-2xl pointer-events-auto absolute inset-0 flex flex-col overflow-hidden rounded-[20px] md:rounded-3xl',
            // No transition — the frame occludes this panel until the
            // handoff; opacity only guards against mis-stacking while idle.
            chatView ? 'opacity-100' : 'opacity-0',
          )}
        >
          <MessageScrollerProvider autoScroll>
            <MessageScroller
              className={cn(
                'min-h-0 flex-1 motion-safe:transition-[opacity,translate]',
                chatView ? panelContent.open : panelContent.closed,
              )}
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
