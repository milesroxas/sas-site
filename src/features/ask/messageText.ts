import type { UIMessage } from 'ai'

/**
 * The words of a transcript message: its text parts joined, nothing else
 * (sources, tool parts, and reasoning are not something anyone said). One
 * reading for the endpoint, the transcript, and the handoff alike.
 */
export function messageText(message: Pick<UIMessage, 'parts'>): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('')
}
