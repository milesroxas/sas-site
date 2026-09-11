'use client'

import type { UIMessage } from 'ai'
import Link from 'next/link'
import type React from 'react'
import { Button } from '@/components/ui/button'
import { ASK_HANDOFF_HREF, saveAskHandoff } from './handoff'

type HandoffLinkProps = Omit<React.ComponentProps<typeof Link>, 'href' | 'onClick' | 'prefetch'> & {
  href: string
  messages: UIMessage[]
}

/**
 * A way out of Ask to a person: opens a contact form with the visitor's
 * questions already in the message, so a lead lands in Inquiries (owned,
 * notified, built to hold contact details) and not in the anonymous Ask log.
 * Every handoff link goes through here: the quiet row below and the handoff
 * card's primary action.
 *
 * A plain link like the transcript's source links, so the menu closes on the
 * route change as it does for those. Not prefetched: it sits in panels that
 * are often open without ever being used. Already on the destination, a push
 * to the same path would do nothing, so it reloads to pick the handoff up.
 */
export function HandoffLink({ href, messages, ...props }: HandoffLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      onClick={(event) => {
        saveAskHandoff(messages)
        if (window.location.pathname === href) {
          event.preventDefault()
          window.location.reload()
        }
      }}
    />
  )
}

/** The quiet way to a person under a finished answer that did not end in a handoff card. */
export function TalkToTeam({ messages }: { messages: UIMessage[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <p className="text-muted-foreground text-xs">Want a person to reply?</p>
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <HandoffLink href={ASK_HANDOFF_HREF} messages={messages}>
          Talk to the team
        </HandoffLink>
      </Button>
    </div>
  )
}
