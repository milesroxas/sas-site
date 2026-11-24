import { IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { Fragment } from 'react'
import { Badge } from '@/components/ui/badge'
import { Visual } from '@/components/Visual'
import { cursorTarget } from '@/features/cursor'
import type { Visual as VisualData } from '@/features/immersive/visual'
import { LABEL } from '@/sections/Browse/registers'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'

/** One term on the row's facts line; `active` sets it in ink. */
export type IndexRowFact = { label: string; active?: boolean }

/** One chip under the title; `active` carries the dot. */
export type IndexRowTag = { slug: string; label: string; active?: boolean }

/**
 * One index row, shared by every editorial listing (the work index and its
 * related-work list, the lab index). Below `md` it is a two-column grid:
 * the thumbnail, facts and tags span both columns and the title takes the
 * first with the arrow opposite it in the second, centered on the title's
 * first line, so a wrapped title hangs below it. The copy wrapper
 * dissolves there (`display: contents`) so the title and arrow are grid
 * siblings, and dense packing seats the arrow in the hole beside the title
 * whether or not a facts line or tags surround it. At `md` the row is one
 * flex line, arrow last; the same nodes in both layouts, so the reveal markers and their
 * beats never duplicate. No row number: the rules already separate the
 * rows, and a mono index on each was decoration.
 *
 * The row's fixed lanes (thumbnail, arrow) and the gaps between them
 * step up with the page column so the copy always keeps a working measure.
 * At `md` the column is 672px: the `lg` sizes would spend 528px of it on the
 * lanes and leave the title one word per line, so the thumbnail and gaps
 * take a size down there and the copy keeps roughly 280px.
 *
 * `data-reveal*` markers are inert without a `ScrollReveal` ancestor
 * (docs/animations.md); each index wraps a row in the under-media reveal so
 * it gates on its own scroll position.
 */
export const IndexRow: React.FC<{
  href: string
  title: string
  visual: VisualData | null
  facts?: IndexRowFact[]
  tags?: IndexRowTag[]
  /** `h2` on an index, where a row is the page's unit; `h3` under a section heading. */
  titleAs?: 'h2' | 'h3'
}> = ({ href, title, visual, facts = [], tags = [], titleAs: TitleTag = 'h2' }) => (
  <Link
    className="group pressable pressable-subtle grid grid-flow-row-dense grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-8 outline-none md:flex md:flex-row md:gap-8 lg:gap-12"
    href={href}
    transitionTypes={[...forwardNavTransitionTypes]}
    {...cursorTarget({ variant: 'view' })}
  >
    <div
      className="relative col-span-2 aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted md:w-56 lg:w-96"
      data-reveal="media"
    >
      {visual && (
        <Visual
          fill
          htmlElement={null}
          imgClassName="object-cover"
          placement="card"
          size="(min-width: 1024px) 24rem, (min-width: 768px) 14rem, 100vw"
          visual={visual}
        />
      )}
    </div>

    <div className="contents md:flex md:min-w-0 md:grow md:flex-col md:gap-4">
      {facts.length > 0 && (
        <p
          className={cn(LABEL, 'col-span-2 text-muted-foreground')}
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
        className="col-start-1 text-subheading text-foreground group-hover:underline"
        data-reveal
        data-reveal-group="row-identity"
      >
        {title}
      </TitleTag>
      {tags.length > 0 && (
        <ul className="col-span-2 flex flex-wrap items-center gap-2" data-reveal>
          {tags.map((tag) => (
            <li key={tag.slug}>
              <Badge
                className={cn(
                  'rounded-full px-3 py-1 font-mono font-normal',
                  tag.active && 'gap-1.5',
                )}
                variant="outline"
              >
                {tag.active && (
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-active" />
                )}
                {tag.label}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* One title line tall (`h-lh` read at the title's type role), so the
        arrow centers on the title's first line below `md`. */}
    <span
      aria-hidden="true"
      className="col-start-2 flex h-lh shrink-0 items-center self-start text-subheading md:self-auto"
      data-reveal
      data-reveal-group="row-furniture"
    >
      <IconArrowUpRight className="size-6 stroke-1 text-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
    </span>
  </Link>
)
