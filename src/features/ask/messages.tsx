'use client'

import type { UIMessage } from 'ai'
import Link from 'next/link'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent } from '@/components/ui/message'

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

export function AskMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const text = message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('')

  return (
    <Message align={isUser ? 'end' : 'start'}>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'default' : 'ghost'}>
          <BubbleContent>
            <p className="whitespace-pre-wrap">{text}</p>
          </BubbleContent>
        </Bubble>
        {!isUser && <AssistantSources message={message} />}
      </MessageContent>
    </Message>
  )
}
