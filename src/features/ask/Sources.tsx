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
import type { AskNextPage } from './handoff'

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
 * The pages an answer drew on, as one inset grouped list (Apple's inset
 * grouped list), so the answer stays the thing read first:
 *
 * - The page to open next (`next`, judge.ts `pickNextPage`) leads as a full
 *   row: the reply's words never carry a path (prompts.ts), so this is the
 *   way there, one tap.
 * - The rest collapse to one disclosure row ("Sources", or "More sources"
 *   under a lead) with the count trailing as a value. The lead is never
 *   listed twice.
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
export function AskSources({
  sources,
  next = null,
}: {
  sources: SourceUrlUIPart[]
  next?: AskNextPage | null
}) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const rest = next ? sources.filter((source) => source.url !== next.url) : sources
  if (!next && rest.length === 0) return null

  return (
    <div className="rounded-xl bg-muted">
      {next ? <AskNextPageRow page={next} ends={rest.length === 0} /> : null}
      {rest.length > 0 ? (
        <>
          <button
            aria-controls={listId}
            aria-expanded={open}
            className={cn(
              'group/disclosure pressable pressable-subtle relative flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left aria-expanded:rounded-b-none md:min-h-9',
              ROW_HOVER,
              ROW_FOCUS,
              // Under the lead row: square top corners, and the group's inset
              // hairline between them, hidden while either row is tinted.
              next &&
                'rounded-t-none before:absolute before:top-0 before:right-0 before:left-12.5 before:h-px before:bg-border hover:before:opacity-0 focus-visible:before:opacity-0 [a:hover+&]:before:opacity-0',
            )}
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <span aria-hidden className="flex size-7 shrink-0 items-center justify-center">
              <IconChevronRight className="size-3.5 text-muted-foreground transition-[rotate,color] duration-200 ease-out-quint group-hover/disclosure:text-foreground group-aria-expanded/disclosure:rotate-90 motion-reduce:transition-none" />
            </span>
            <span className="min-w-0 flex-1 text-xs/4 font-medium">
              {next ? 'More sources' : 'Sources'}
            </span>
            <span className="min-w-4 text-right text-xs/4 text-muted-foreground tabular-nums transition-colors group-hover/disclosure:text-foreground">
              {rest.length}
            </span>
          </button>

          <div className="disclosure-body" data-open={open || undefined} id={listId} inert={!open}>
            <div>
              <ul>
                {rest.map((source) => (
                  <SourceRow key={source.sourceId} source={source} />
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

/**
 * The page a reply points to next, leading the Sources group: the same
 * glyph, title and section lanes as the rows under it, a step taller, so it
 * reads as the one to open. `ends` when nothing follows it in the group.
 */
function AskNextPageRow({ page, ends }: { page: AskNextPage; ends: boolean }) {
  const surface = surfaceForPath(page.url)
  const Glyph = (surface && SURFACE_GLYPHS[surface.collection]) || IconFileText

  return (
    <Link
      className={cn(
        'group/source pressable pressable-subtle flex min-h-14 items-center gap-2.5 rounded-t-xl px-3 py-2',
        ends && 'rounded-b-xl',
        ROW_HOVER,
        ROW_FOCUS,
      )}
      href={page.url}
    >
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-xs ring-1 ring-foreground/6"
      >
        <Glyph className="size-3.5 text-primary" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-base/6 md:text-sm/5">{page.title}</span>
        {surface ? (
          <span className="truncate text-xs/4 text-muted-foreground">{surface.title}</span>
        ) : null}
      </span>
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
        <IconArrowRight className="size-3.5 text-muted-foreground motion-safe:transition-[translate,color] motion-safe:duration-150 motion-safe:ease-out group-hover/source:text-foreground pointer-fine:group-hover/source:translate-x-px" />
      </span>
    </Link>
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
