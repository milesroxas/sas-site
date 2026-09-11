'use client'

import type { ChatStatus } from 'ai'
import { Fragment } from 'react'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent } from '@/components/ui/message'
import { MessageScrollerItem } from '@/components/ui/message-scroller'
import { HandoffCard } from './HandoffCard'
import { type AskUIMessage, handoffOf } from './handoff'
import { messageText } from './messageText'
import { ASK_NOTICE } from './retention'
import { AskSources } from './Sources'
import { TalkToTeam } from './TalkToTeam'

/**
 * Entrance for anything that joins the transcript (messages, the Thinking
 * shimmer, the handoff card, errors): a short rise from the composer's
 * direction on the site's settle curve. Mount-once keyframes are safe here:
 * items never re-trigger.
 */
export const transcriptItemEnter =
  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:ease-out-quint'

/**
 * Shared transcript pieces for every Ask surface (the /ask page widget, the
 * takeover-menu chat, and the footer's closing band) so message rendering
 * and error unwrapping stay identical.
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
 * card, like its sources, lands once the reply settles, so it closes the
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
 * transcript with its first delta, or, when the card is the whole reply,
 * with the card as the reply settles.
 *
 * A reply that hands off renders its card as its own item after the answer,
 * so the card rises in on its own beat once the words are done. The quiet
 * "Talk to the team" row only closes a finished reply that did not already
 * end in a card; it also stands in for a reply that settled with nothing to
 * read, so there is always a way forward.
 */
export function TranscriptItems({
  messages,
  status,
}: {
  messages: AskUIMessage[]
  status: ChatStatus
}) {
  const last = messages.at(-1)
  const lastIsAssistant = last?.role === 'assistant'
  const awaitingReply = lastIsAssistant && !hasReply(last, status === 'streaming')
  const visible = awaitingReply ? messages.slice(0, -1) : messages
  const pending = status === 'submitted' || (status === 'streaming' && awaitingReply)
  // The way to a person waits for a finished answer: offering it mid-stream
  // would pull the eye off the reply being read.
  const settled = status === 'ready' && lastIsAssistant
  const endsInCard = lastIsAssistant && handoffOf(last) !== null

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
        const handoff = message.role === 'assistant' && !live ? handoffOf(message) : null
        return (
          <Fragment key={message.id}>
            {messageText(message) !== '' && (
              <MessageScrollerItem messageId={message.id} scrollAnchor={message.role === 'user'}>
                <AskMessage message={message} streaming={live} />
              </MessageScrollerItem>
            )}
            {handoff && (
              <MessageScrollerItem messageId={`${message.id}:handoff`}>
                <div className={transcriptItemEnter}>
                  <HandoffCard handoff={handoff} messages={messages} />
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
      {settled && !endsInCard && (
        <MessageScrollerItem messageId="ask-handoff">
          <div className={transcriptItemEnter}>
            <TalkToTeam messages={messages} />
          </div>
        </MessageScrollerItem>
      )}
    </>
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
          {/* Chat body reads at 16px on touch, 14px from md: the primitives'
              12px is caption-scale, too small for a conversation surface. */}
          <BubbleContent className="px-3 py-2 text-base/relaxed md:px-2.5 md:py-1.5 md:text-sm/relaxed">
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
