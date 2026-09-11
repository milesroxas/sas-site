'use client'

import type { UIMessage } from 'ai'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ASK_HANDOFF_HREF, saveAskHandoff } from './handoff'

/**
 * The way out of Ask to a person: opens the contact form with the visitor's
 * questions already in the message, so a lead lands in Inquiries (owned,
 * notified, built to hold contact details) and not in the anonymous Ask log.
 *
 * A plain link like the transcript's source links, so the menu closes on the
 * route change as it does for those. Not prefetched: it sits in panels that
 * are often open without ever being used. On the contact page itself a push
 * to the same path would do nothing, so it reloads to pick the handoff up.
 */
export function TalkToTeam({ messages }: { messages: UIMessage[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <p className="text-muted-foreground text-xs">Want a person to reply?</p>
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link
          href={ASK_HANDOFF_HREF}
          prefetch={false}
          onClick={(event) => {
            saveAskHandoff(messages)
            if (window.location.pathname === ASK_HANDOFF_HREF) {
              event.preventDefault()
              window.location.reload()
            }
          }}
        >
          Talk to the team
        </Link>
      </Button>
    </div>
  )
}
