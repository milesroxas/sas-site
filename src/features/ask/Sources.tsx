'use client'

import {
  type Icon,
  IconArrowRight,
  IconArticle,
  IconBriefcase,
  IconBulb,
  IconChevronRight,
  IconFileText,
  IconFlask,
  IconMail,
  IconUsers,
} from '@tabler/icons-react'
import type { SourceUrlUIPart } from 'ai'
import Link from 'next/link'
import type { CollectionSlug } from 'payload'
import { useId, useState } from 'react'
import { surfaceForPath } from '@/shared/content/surfaces'
import { cn } from '@/utilities/ui'

/**
 * A glyph per content surface, so a row says what kind of page it opens
 * before its title is read. Root pages and anything outside a surface take
 * the plain page glyph.
 */
const SURFACE_GLYPHS: Partial<Record<CollectionSlug, Icon>> = {
  'audience-pages': IconUsers,
  'contact-pages': IconMail,
  'expertise-pages': IconBulb,
  'lab-pages': IconFlask,
  posts: IconArticle,
  'work-pages': IconBriefcase,
}

/** Row and header tint: the group's own muted ground, a step toward the ink. */
const ROW_HOVER = 'hover:bg-foreground/3'

/** Inset so the ring survives the transcript item's paint containment and the body's clip. */
const ROW_FOCUS = 'outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-ring/50'

/**
 * The pages an answer drew on, as a disclosure group (Apple's inset grouped
 * list): collapsed to one "Sources" row with the count trailing as a value,
 * so the answer stays the thing read first.
 *
 * The chevron sits in the leading lane like a disclosure triangle, pointing
 * right when closed and turning down when open; a trailing chevron would read
 * as "opens another screen". The body is the site's shared disclosure track
 * (`.disclosure-body`, globals.css), so it opens and closes on the same beat
 * as the FAQ and the stepped form, and goes `inert` while closed so its links
 * leave the tab order (and are never prefetched unseen).
 *
 * Rows sit on inset hairlines that start at the title lane; a hovered or
 * focused row hides the hairlines on both of its edges so the tint reads as
 * one shape. Every lane is a fixed-width slot, so glyphs, titles and arrows
 * line up down the list whatever the titles say.
 */
export function AskSources({ sources }: { sources: SourceUrlUIPart[] }) {
  const [open, setOpen] = useState(false)
  const listId = useId()

  return (
    <div className="rounded-xl bg-muted">
      <button
        aria-controls={listId}
        aria-expanded={open}
        className={cn(
          'group/disclosure pressable pressable-subtle flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left aria-expanded:rounded-b-none md:min-h-9',
          ROW_HOVER,
          ROW_FOCUS,
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center">
          <IconChevronRight className="size-3.5 text-muted-foreground transition-[rotate,color] duration-200 ease-out-quint group-hover/disclosure:text-foreground group-aria-expanded/disclosure:rotate-90 motion-reduce:transition-none" />
        </span>
        <span className="min-w-0 flex-1 text-xs/4 font-medium">Sources</span>
        <span className="min-w-4 text-right text-xs/4 text-muted-foreground tabular-nums transition-colors group-hover/disclosure:text-foreground">
          {sources.length}
        </span>
      </button>

      <div className="disclosure-body" data-open={open || undefined} id={listId} inert={!open}>
        <div>
          <ul>
            {sources.map((source) => (
              <SourceRow key={source.sourceId} source={source} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function SourceRow({ source }: { source: SourceUrlUIPart }) {
  const surface = surfaceForPath(source.url)
  const Glyph = (surface && SURFACE_GLYPHS[surface.collection]) || IconFileText

  return (
    <li className="group/row">
      <Link
        className={cn(
          'group/source pressable pressable-subtle relative flex min-h-12 items-center gap-2.5 px-3 group-last/row:rounded-b-xl',
          ROW_HOVER,
          ROW_FOCUS,
          // The inset hairline on this row's top edge, and the rules that
          // hide it beside a tinted neighbor: this row, the row above it, or
          // the disclosure header above the first row.
          'before:absolute before:top-0 before:right-0 before:left-12.5 before:h-px before:bg-border',
          'hover:before:opacity-0 focus-visible:before:opacity-0',
          '[li:hover+li>&]:before:opacity-0 [li:has(:focus-visible)+li>&]:before:opacity-0',
          '[button:hover+div_li:first-child>&]:before:opacity-0',
        )}
        href={source.url}
      >
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-xs ring-1 ring-foreground/6"
        >
          <Glyph className="size-3.5 text-primary" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base/6 md:text-sm/5">{source.title ?? source.url}</span>
          {surface ? (
            <span className="truncate text-xs/4 text-muted-foreground">{surface.title}</span>
          ) : null}
        </span>
        <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
          <IconArrowRight className="size-3.5 text-muted-foreground motion-safe:transition-[translate,color] motion-safe:duration-150 motion-safe:ease-out group-hover/source:text-foreground pointer-fine:group-hover/source:translate-x-px" />
        </span>
      </Link>
    </li>
  )
}
