import { IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { Fragment } from 'react'
import { Media } from '@/components/Media'
import { Badge } from '@/components/ui/badge'
import { cursorTarget } from '@/features/cursor'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import type { WorksBrowseItem } from './queries'
import { FIGURE, LABEL, padIndex } from './registers'

/**
 * Taxonomy terms the row is being read against, by slug. A capability chip
 * that matches carries the active dot; a matching industry sets in ink inside
 * the facts line. The related-work list on a segment page passes the page's
 * own terms so every row shows why it is there; the index passes nothing.
 */
export type WorkRowHighlight = {
  capabilities?: readonly string[]
  industries?: readonly string[]
}

type Fact = { label: string; active?: boolean }

/**
 * One index row. Below `md` it stacks and the number and arrow ride a header
 * line; at `md` that wrapper dissolves (`display: contents`) so both become
 * direct children of the row: the same nodes in both layouts, so the reveal
 * markers and their beats never duplicate.
 *
 * The row's fixed lanes (number, thumbnail, arrow) and the gaps between them
 * step up with the page column so the copy always keeps a working measure.
 * At `md` the column is 672px: the `lg` sizes would spend 528px of it on the
 * lanes and leave the title one word per line, so the thumbnail and gaps
 * take a size down there and the copy keeps roughly 280px.
 *
 * `data-reveal*` markers are inert without a `ScrollReveal` ancestor
 * (docs/animations.md); the index and the related-work list each wrap a row
 * in the under-media reveal so it gates on its own scroll position.
 */
export const WorkRow: React.FC<{
  item: WorksBrowseItem
  index: number
  highlight?: WorkRowHighlight
  /** `h2` on the index, where a row is the page's unit; `h3` under a section heading. */
  titleAs?: 'h2' | 'h3'
}> = ({ item, index, highlight, titleAs: TitleTag = 'h2' }) => {
  const industry = item.industries[0]
  const facts: Fact[] = []
  if (item.client) facts.push({ label: item.client })
  if (industry) {
    facts.push({ label: industry.label, active: highlight?.industries?.includes(industry.slug) })
  }
  if (item.year) facts.push({ label: item.year })

  return (
    <Link
      className="group pressable pressable-subtle flex flex-col gap-5 py-8 outline-none md:flex-row md:items-center md:gap-8 lg:gap-12"
      href={`/works/${item.slug}`}
      transitionTypes={[...forwardNavTransitionTypes]}
      {...cursorTarget({ variant: 'view' })}
    >
      <div className="flex items-center justify-between md:contents">
        <span
          className={cn(FIGURE, 'text-muted-foreground md:w-10 md:shrink-0')}
          data-reveal
          data-reveal-group="row-furniture"
        >
          {padIndex(index)}
        </span>
        <IconArrowUpRight
          aria-hidden="true"
          className="size-6 shrink-0 stroke-1 text-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none md:order-last"
          data-reveal
          data-reveal-group="row-furniture"
        />
      </div>

      <div
        className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted md:w-56 lg:w-96"
        data-reveal="media"
      >
        {item.media && (
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover"
            resource={item.media}
            size="(min-width: 1024px) 24rem, (min-width: 768px) 14rem, 100vw"
          />
        )}
      </div>

      <div className="flex min-w-0 grow flex-col gap-4">
        {facts.length > 0 && (
          <p
            className={cn(LABEL, 'text-muted-foreground')}
            data-reveal
            data-reveal-group="row-identity"
          >
            {facts.map((fact, position) => (
              <Fragment key={fact.label}>
                {position > 0 && ' · '}
                <span className={cn(fact.active && 'text-foreground')}>{fact.label}</span>
              </Fragment>
            ))}
          </p>
        )}
        <TitleTag
          className="text-heading-3 text-foreground group-hover:underline"
          data-reveal
          data-reveal-group="row-identity"
        >
          {item.title}
        </TitleTag>
        {item.capabilities.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2" data-reveal>
            {item.capabilities.map((capability) => {
              const active = highlight?.capabilities?.includes(capability.slug)
              return (
                <li key={capability.slug}>
                  <Badge
                    className={cn(
                      'rounded-full px-3 py-1 font-mono font-normal',
                      active && 'gap-1.5',
                    )}
                    variant="outline"
                  >
                    {active && (
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-active" />
                    )}
                    {capability.label}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Link>
  )
}
