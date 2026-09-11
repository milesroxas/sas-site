'use client'

import { IconArrowUpRight } from '@tabler/icons-react'
import type { ChatStatus, UIMessage } from 'ai'
import Link from 'next/link'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent } from '@/components/ui/message'
import { MessageScrollerItem } from '@/components/ui/message-scroller'
import { ASK_NOTICE } from './retention'
import { TalkToTeam } from './TalkToTeam'

/**
 * Entrance for anything that joins the transcript (messages, the Thinking
 * shimmer, errors): a short rise from the composer's direction with a strong
 * ease-out. Mount-once keyframes are safe here — items never re-trigger.
 */
export const transcriptItemEnter =
  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]'

/** Gap between staggered source links; short enough that four never feel slow. */
const SOURCE_STAGGER_MS = 40

/**
 * Shared transcript pieces for every Ask surface (the /ask page widget and the
 * takeover-menu chat) so message rendering and error unwrapping stay identical.
 */

export function errorText(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as { error?: unknown }
    if (typeof parsed.error === 'string') return parsed.error
  } catch {
    // not a JSON error body — fall through
  }
  return error.message || 'Something went wrong — try again.'
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

/**
 * Source links land after the answer, never before it: /api/ask streams the
 * matched documents ahead of the first token, so rendered as they arrive they
 * would head an empty bubble and then be pushed down by every delta. Each
 * link rises in on the same entrance as a message, staggered by index;
 * `fill-mode-backwards` holds the delayed ones hidden until their turn.
 */
function AssistantSources({ message }: { message: UIMessage }) {
  const sources = message.parts.filter(
    (part): part is Extract<typeof part, { type: 'source-url' }> => part.type === 'source-url',
  )
  if (sources.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      <p className={`text-muted-foreground text-xs font-medium ${transcriptItemEnter}`}>Sources</p>
      <ul className="flex flex-col gap-1">
        {sources.map((source, index) => (
          <li
            key={source.sourceId}
            className={`${transcriptItemEnter} motion-safe:fill-mode-backwards`}
            style={{ animationDelay: `${(index + 1) * SOURCE_STAGGER_MS}ms` }}
          >
            <Link
              href={source.url}
              className="group/source inline-flex items-center gap-1 text-xs underline underline-offset-4 hover:text-primary motion-safe:transition-colors motion-safe:duration-150"
            >
              {source.title ?? source.url}
              <IconArrowUpRight
                aria-hidden
                className="size-3 shrink-0 text-muted-foreground motion-safe:transition-[translate,color] motion-safe:duration-150 motion-safe:ease-out group-hover/source:text-primary pointer-fine:group-hover/source:translate-x-px pointer-fine:group-hover/source:-translate-y-px"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The transcript body shared by every Ask surface: the message list plus the
 * Thinking shimmer while a reply is pending. Renders inside a
 * MessageScrollerContent.
 *
 * "Pending" covers the whole wait for the first token, not just `submitted`:
 * the stream opens with source parts before the model has said anything, and
 * an assistant message with no text yet is held back (the shimmer stays)
 * rather than mounted as an empty bubble. It joins the transcript with its
 * first delta, which is the moment there is something to read.
 */
export function TranscriptItems({
  messages,
  status,
}: {
  messages: UIMessage[]
  status: ChatStatus
}) {
  const last = messages.at(-1)
  const emptyAssistant = last?.role === 'assistant' && messageText(last) === ''
  const visible = emptyAssistant ? messages.slice(0, -1) : messages
  const pending = status === 'submitted' || (status === 'streaming' && emptyAssistant)
  // The way to a person waits for a finished answer: offering it mid-stream
  // would pull the eye off the reply being read.
  const settled = status === 'ready' && last?.role === 'assistant' && !emptyAssistant

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
      {visible.map((message, index) => (
        <MessageScrollerItem
          key={message.id}
          messageId={message.id}
          scrollAnchor={message.role === 'user'}
        >
          <AskMessage
            message={message}
            streaming={status === 'streaming' && index === visible.length - 1}
          />
        </MessageScrollerItem>
      ))}
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
      {settled && (
        <MessageScrollerItem messageId="ask-handoff">
          <div className={transcriptItemEnter}>
            <TalkToTeam messages={messages} />
          </div>
        </MessageScrollerItem>
      )}
    </>
  )
}

export function AskMessage({
  message,
  streaming = false,
}: {
  message: UIMessage
  /** This message is still receiving deltas: hold its sources until it settles. */
  streaming?: boolean
}) {
  const isUser = message.role === 'user'
  const text = messageText(message)

  return (
    <Message align={isUser ? 'end' : 'start'} className={transcriptItemEnter}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'default' : 'ghost'}>
          {/* Chat body reads at 16px on touch, 14px from md — the primitives'
              12px is caption-scale, too small for a conversation surface. */}
          <BubbleContent className="px-3 py-2 text-base/relaxed md:px-2.5 md:py-1.5 md:text-sm/relaxed">
            <p className="whitespace-pre-wrap">{text}</p>
          </BubbleContent>
        </Bubble>
        {!isUser && !streaming && <AssistantSources message={message} />}
      </MessageContent>
    </Message>
  )
}
