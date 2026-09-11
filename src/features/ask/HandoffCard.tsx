'use client'

import { IconArrowRight, IconArrowUpRight, IconMessageCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ASK_HANDOFFS, type AskHandoff, type AskUIMessage } from './handoff'
import { HandoffLink } from './TalkToTeam'

/** Arrows lean toward where they go; the nudge is hover-only and pointer-only. */
const ARROW_MOTION =
  'motion-safe:transition-[translate,color] motion-safe:duration-150 motion-safe:ease-out'

/**
 * The next step when a person should take it from here: what we can promise
 * (from Site Info, never from the model), one filled action that opens the
 * right contact form with the visitor's questions already in it, and the
 * booking link beside it when the studio has one.
 *
 * Arrows follow one rule across Ask: → stays on the site, ↗ leaves it.
 */
export function HandoffCard({
  handoff,
  messages,
}: {
  handoff: AskHandoff
  messages: AskUIMessage[]
}) {
  const card = ASK_HANDOFFS[handoff.reason]
  const asked = messages.filter((message) => message.role === 'user').length

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted p-4">
      <div className="flex flex-col gap-1">
        <p className="text-base/5 font-medium">{card.title}</p>
        <p className="text-base/relaxed text-muted-foreground md:text-sm/5">
          {card.body(handoff.responseTime)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="chat">
          <HandoffLink href={handoff.href} messages={messages}>
            {card.action}
            <IconArrowRight
              data-icon="inline-end"
              className={`${ARROW_MOTION} pointer-fine:group-hover/button:translate-x-0.5`}
            />
          </HandoffLink>
        </Button>
        {handoff.scheduleUrl ? (
          <Button asChild size="chat" variant="outline" className="bg-background shadow-xs">
            <a href={handoff.scheduleUrl} rel="noopener noreferrer" target="_blank">
              Book a call
              <IconArrowUpRight
                data-icon="inline-end"
                className={`${ARROW_MOTION} text-muted-foreground group-hover/button:text-foreground pointer-fine:group-hover/button:translate-x-px pointer-fine:group-hover/button:-translate-y-px`}
              />
            </a>
          </Button>
        ) : null}
      </div>

      <p className="flex items-center gap-1.5 border-t border-border pt-3 text-xs/4 text-muted-foreground">
        <IconMessageCheck aria-hidden className="size-3.5 shrink-0" />
        {asked > 1
          ? 'Your questions come with you, ready to edit before you send.'
          : 'Your question comes with you, ready to edit before you send.'}
      </p>
    </div>
  )
}
