'use client'

import { IconMail } from '@tabler/icons-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { ASK_HANDOFF_ACTION, ASK_HANDOFF_HREF } from './handoff'

/**
 * The way to a person that never moves: "Email a partner" in every Ask
 * surface's chrome, so a visitor who wants the team finds it where they found
 * it last, whatever the reply above says. Under a reply the team only appears
 * when the conversation calls for it (`ASK_HANDOFFS`); this is the manual
 * path, one tap.
 *
 * With a conversation it opens the handoff form in the transcript, the same
 * form and the same draft (`useAskChat().openHandoff`), and once the visitor
 * has sent it brings the receipt back into view. Before the first question
 * there is nothing to send from the chat, so it is the contact page.
 */
export function AskContactButton({
  conversation,
  onOpen,
  className,
}: {
  /** The transcript has a question in it. */
  conversation: boolean
  onOpen: () => void
  className?: string
}) {
  const label = (
    <>
      <IconMail data-icon="inline-start" aria-hidden />
      {ASK_HANDOFF_ACTION}
    </>
  )
  const classes = cn('font-normal', className)
  if (!conversation) {
    return (
      <Button asChild className={classes} size="chat" variant="ghost">
        <Link href={ASK_HANDOFF_HREF} prefetch={false}>
          {label}
        </Link>
      </Button>
    )
  }
  return (
    <Button className={classes} onClick={onOpen} size="chat" type="button" variant="ghost">
      {label}
    </Button>
  )
}
