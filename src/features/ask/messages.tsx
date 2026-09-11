'use client'

import type { ChatStatus } from 'ai'
import { Fragment } from 'react'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent } from '@/components/ui/message'
import { MessageScrollerItem } from '@/components/ui/message-scroller'
import { cn } from '@/utilities/ui'
import { type AskHandoffReceipt, type AskHandoffSent, Handoff } from './HandoffPanel'
import {
  ASK_HANDOFFS,
  type AskHandoffKind,
  type AskHandoffTerms,
  type AskUIMessage,
  handoffOf,
} from './handoff'
import { messageText } from './messageText'
import { ASK_NOTICE } from './retention'
import { AskSources } from './Sources'

/**
 * Entrance for anything that joins the transcript (messages, the Thinking
 * shimmer, the handoff, errors): a short rise from the composer's
 * direction on the site's settle curve. Mount-once keyframes are safe here:
 * items never re-trigger.
 */
export const transcriptItemEnter =
  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:ease-out-quint'

/**
 * The handoff's entrance when it follows a lead line that mounts on the same
 * render: the words land first, the offer a beat after, so the two read as
 * "here is why, and here is the way" rather than one block. An arbitrary
 * animation-delay on purpose, as the closing band's composer does: `delay-*`
 * also sets transition-delay, which would hold the chip's press feedback.
 */
const handoffAfterLead = 'motion-safe:[animation-delay:150ms] motion-safe:fill-mode-backwards'

/**
 * Shared transcript pieces for every Ask surface (the takeover-menu chat, the
 * footer's closing band, and the /ask page widget) so message rendering and
 * error unwrapping stay identical.
 */

export function errorText(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as { error?: unknown }
    if (typeof parsed.error === 'string') return parsed.error
  } catch {
    // not a JSON error body; fall through
  }
  return error.message || 'Something went wrong. Try again.'
}

/**
 * Something to read yet. While a reply streams only its words count: its
 * handoff, like its sources, lands once the reply settles, so it closes the
 * answer instead of being written over by it.
 */
const hasReply = (message: AskUIMessage, live: boolean) =>
  messageText(message) !== '' || (!live && handoffOf(message) !== null)

/**
 * The transcript body shared by every Ask surface: the message list, the
 * Thinking shimmer while a reply is pending, and the way to a person once it
 * has settled. Renders inside a MessageScrollerContent.
 *
 * "Pending" covers the whole wait for something to read, not just
 * `submitted`: the stream opens with source parts before the model has said
 * anything, and an assistant message with nothing to read yet is held back
 * (the shimmer stays) rather than mounted as an empty bubble. It joins the
 * transcript with its first delta, or, when the handoff is the whole reply,
 * with the reason's lead line as the reply settles.
 *
 * One handoff per conversation. The reply that ends the transcript, once
 * settled, closes with the offer (the model's reason, or the quiet `none`
 * one), rendered as its own item after the words and the sources; a reply
 * that settled with nothing to read gets the quiet offer alone. A newer
 * reply takes the offer with it; an earlier reply's lead line stays, since
 * it was the reply. Once the visitor has sent, the receipt stays pinned to
 * the reply it closed and no later reply offers again.
 */
export function TranscriptItems({
  messages,
  status,
  terms,
  sent,
  onSent,
}: {
  messages: AskUIMessage[]
  status: ChatStatus
  /** Site Info's promise, for the quiet offer that carries no resolved handoff of its own. */
  terms: AskHandoffTerms
  /** The handoff the visitor has sent in this conversation, if any. */
  sent: AskHandoffSent | null
  onSent: (messageId: string, receipt: AskHandoffReceipt) => void
}) {
  const last = messages.at(-1)
  const lastIsAssistant = last?.role === 'assistant'
  const awaitingReply = lastIsAssistant && !hasReply(last, status === 'streaming')
  // A reply still on its way is held back (the shimmer stays for it). One
  // that settled with nothing to read (a tool call the schema refused, an
  // answer cut to nothing) stays in, so the quiet offer can close it and
  // there is always a way forward.
  const visible = awaitingReply && status !== 'ready' ? messages.slice(0, -1) : messages
  const pending = status === 'submitted' || (status === 'streaming' && awaitingReply)
  // The way to a person waits for a finished answer: offering it mid-stream
  // would pull the eye off the reply being read.
  const settled = status === 'ready' && lastIsAssistant

  return (
    <>
      {visible.length > 0 && (
        <MessageScrollerItem messageId="ask-notice">
          <p
            className={`text-balance text-center text-muted-foreground text-xs/relaxed ${transcriptItemEnter}`}
          >
            {ASK_NOTICE}
          </p>
        </MessageScrollerItem>
      )}
      {visible.map((message, index) => {
        const live = status === 'streaming' && index === visible.length - 1
        const isAssistant = message.role === 'assistant'
        const text = messageText(message)
        const handoff = isAssistant && !live ? handoffOf(message) : null
        const lead = handoff && text === '' ? ASK_HANDOFFS[handoff.reason].lead : null
        const sentHere = sent?.messageId === message.id
        const closes = settled && !sent && index === visible.length - 1 && isAssistant
        const kind: AskHandoffKind = handoff?.reason ?? 'none'
        const handoffId = `${message.id}:handoff`
        return (
          <Fragment key={message.id}>
            {text !== '' && (
              <MessageScrollerItem messageId={message.id} scrollAnchor={message.role === 'user'}>
                <AskMessage message={message} streaming={live} />
              </MessageScrollerItem>
            )}
            {lead && (
              <MessageScrollerItem messageId={`${message.id}:lead`}>
                <AskReply>{lead}</AskReply>
              </MessageScrollerItem>
            )}
            {(sentHere || closes) && (
              <MessageScrollerItem messageId={handoffId}>
                <div className={cn(transcriptItemEnter, lead && handoffAfterLead)}>
                  <Handoff
                    itemId={handoffId}
                    kind={kind}
                    messages={messages}
                    onSent={(receipt) => onSent(message.id, receipt)}
                    receipt={sentHere ? sent.receipt : null}
                    terms={handoff ?? terms}
                  />
                </div>
              </MessageScrollerItem>
            )}
          </Fragment>
        )
      })}
      {pending && (
        <MessageScrollerItem messageId="pending">
          <p
            role="status"
            className={`shimmer text-muted-foreground text-sm/relaxed md:text-xs/relaxed ${transcriptItemEnter}`}
          >
            Thinking…
          </p>
        </MessageScrollerItem>
      )}
    </>
  )
}

/**
 * Chat body reads at 16px on touch, 14px from md: the primitives' 12px is
 * caption-scale, too small for a conversation surface.
 */
const bubbleBody = 'px-3 py-2 text-base/relaxed md:px-2.5 md:py-1.5 md:text-sm/relaxed'

/** The assistant's words with no message of their own: a handoff's lead line. */
function AskReply({ children }: { children: string }) {
  return (
    <Message align="start" className={transcriptItemEnter}>
      <MessageContent>
        <Bubble align="start" variant="ghost">
          <BubbleContent className={bubbleBody}>
            <p className="whitespace-pre-wrap">{children}</p>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

/**
 * One message: the bubble, and under an assistant's answer the pages it
 * drew on. Those land after the answer, never before it: /api/ask streams
 * the matched documents ahead of the first token, so rendered as they arrive
 * they would head an empty bubble and then be pushed down by every delta.
 * The group rises in once the answer settles.
 */
export function AskMessage({
  message,
  streaming = false,
}: {
  message: AskUIMessage
  /** This message is still receiving deltas: hold its sources until it settles. */
  streaming?: boolean
}) {
  const isUser = message.role === 'user'
  const sources =
    isUser || streaming
      ? []
      : message.parts.filter(
          (part): part is Extract<typeof part, { type: 'source-url' }> =>
            part.type === 'source-url',
        )

  return (
    <Message align={isUser ? 'end' : 'start'} className={transcriptItemEnter}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'default' : 'ghost'}>
          <BubbleContent className={bubbleBody}>
            <p className="whitespace-pre-wrap">{messageText(message)}</p>
          </BubbleContent>
        </Bubble>
        {sources.length > 0 && (
          <div className={transcriptItemEnter}>
            <AskSources sources={sources} />
          </div>
        )}
      </MessageContent>
    </Message>
  )
}
