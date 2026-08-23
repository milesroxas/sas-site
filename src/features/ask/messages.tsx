'use client'

import type { UIMessage } from 'ai'
import Link from 'next/link'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent } from '@/components/ui/message'
import { MessageScrollerItem } from '@/components/ui/message-scroller'

/**
 * Entrance for anything that joins the transcript (messages, the Thinking
 * shimmer, errors): a short rise from the composer's direction with a strong
 * ease-out. Mount-once keyframes are safe here — items never re-trigger.
 */
export const transcriptItemEnter =
  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]'

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

function AssistantSources({ message }: { message: UIMessage }) {
  const sources = message.parts.filter(
    (part): part is Extract<typeof part, { type: 'source-url' }> => part.type === 'source-url',
  )
  if (sources.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground text-xs font-medium">Sources</p>
      <ul className="flex flex-col gap-1">
        {sources.map((source) => (
          <li key={source.sourceId}>
            <Link href={source.url} className="text-xs underline underline-offset-4">
              {source.title ?? source.url}
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
 */
export function TranscriptItems({
  messages,
  pending,
}: {
  messages: UIMessage[]
  pending: boolean
}) {
  return (
    <>
      {messages.map((message) => (
        <MessageScrollerItem
          key={message.id}
          messageId={message.id}
          scrollAnchor={message.role === 'user'}
        >
          <AskMessage message={message} />
        </MessageScrollerItem>
      ))}
      {pending && (
        <MessageScrollerItem messageId="pending">
          <p
            className={`shimmer text-muted-foreground text-sm/relaxed md:text-xs/relaxed ${transcriptItemEnter}`}
          >
            Thinking…
          </p>
        </MessageScrollerItem>
      )}
    </>
  )
}

export function AskMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const text = message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('')

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
        {!isUser && <AssistantSources message={message} />}
      </MessageContent>
    </Message>
  )
}
