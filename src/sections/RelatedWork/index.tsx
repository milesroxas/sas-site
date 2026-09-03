import { IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { HeroEyebrow } from '@/heros/shared'
import type { Capability, Industry } from '@/payload-types'
import type { WorksBrowseFilterOption, WorksBrowseItem } from '@/sections/WorksBrowse/queries'
import { LABEL } from '@/sections/WorksBrowse/registers'
import { WorkRow, type WorkRowHighlight } from '@/sections/WorksBrowse/WorkRow'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

/** The taxonomy a segment page is defined by, and that its related work is matched on. */
export type RelatedWorkFilterKind = keyof WorkRowHighlight

export type RelatedWorkFilter = {
  kind: RelatedWorkFilterKind
  /** The page's own terms: one filter row each, and the slugs every row is read against. */
  terms: WorksBrowseFilterOption[]
}

/**
 * Standing copy per segment kind. Site voice rather than CMS: what the block
 * *lists* is the Positioning tab's job, this is the one sentence that tells a
 * reader how the list was chosen, and it is the same on every page of a kind.
 */
const RELATED_WORK_COPY = {
  capabilities: {
    label: 'Capability',
    heading: 'Work shaped by this expertise',
    description: 'Case studies from the index, chosen by shared capability.',
  },
  industries: {
    label: 'Industry',
    heading: 'Work shaped for this audience',
    description: 'Case studies from the index, chosen by shared industry.',
  },
} as const satisfies Record<
  RelatedWorkFilterKind,
  { label: string; heading: string; description: string }
>

/**
 * A segment page's taxonomy relationship as filter terms. Bare ids (a term the
 * query left unpopulated) are dropped: a row with no name is not a filter.
 */
export const relatedWorkTerms = (
  docs: (number | Capability | Industry)[] | null | undefined,
): WorksBrowseFilterOption[] =>
  (docs ?? []).flatMap((doc) =>
    typeof doc === 'object' ? [{ slug: doc.slug, label: doc.name }] : [],
  )

/**
 * The related-work closer on expertise and audience pages: an excerpt of the
 * works index, filtered by the page's own taxonomy. The aside names the filter
 * the way the Insights sidebar names a topic (hairline rows, the active
 * marker); the list is the index's own row, with the matching term lit in
 * each row so the relation is visible rather than stated.
 *
 * Layout sits on `BlockGrid`: from `2xl` the aside takes two columns and the
 * list the other six, the narrowest column that still seats the index row
 * (number lane, thumbnail, arrow) with a two-line title beside it. Below that
 * the list takes the full width and the aside sits above it on half the
 * columns, its filter terms running inline so the aside spends its height on
 * the heading rather than on one hairline row per term. Motion is
 * the site's two reveals and nothing else: the aside plays the intro reveal
 * as one cluster, each row plays the under-media reveal gated on its own
 * position, exactly as the index does on first paint.
 */
export const RelatedWorkSection: React.FC<{
  filter: RelatedWorkFilter
  /** Overrides the standing heading for the kind. */
  heading?: string
  items: WorksBrowseItem[]
}> = ({ filter, heading, items }) => {
  if (!items.length) return null

  const copy = RELATED_WORK_COPY[filter.kind]
  const slugs = filter.terms.map((term) => term.slug)
  const highlight: WorkRowHighlight =
    filter.kind === 'capabilities' ? { capabilities: slugs } : { industries: slugs }

  return (
    <Section spacing="normal">
      <Container>
        <BlockGrid>
          <ScrollReveal as="div" className="md:col-span-4 2xl:col-span-2" variant="intro">
            <div className="flex flex-col items-start gap-6 2xl:sticky 2xl:top-24">
              {/* Grouped with the heading it labels: one thought, one beat. */}
              <div data-reveal data-reveal-group="related-intro">
                <HeroEyebrow eyebrow="Related work" />
              </div>
              <h2
                className="text-heading-2 text-foreground"
                data-reveal
                data-reveal-group="related-intro"
              >
                {heading ?? copy.heading}
              </h2>
              <p className="max-w-sm text-base leading-relaxed text-muted-foreground" data-reveal>
                {copy.description}
              </p>
              {filter.terms.length > 0 && (
                <div className="flex w-full flex-col pt-6" data-reveal>
                  <p className={cn(LABEL, 'pb-2 text-muted-foreground 2xl:pb-4')}>{copy.label}</p>
                  {/* The Insights sidebar's active row, static: the term is the
                      page, so there is nothing to toggle. It takes both of that
                      row's forms, and turns where this aside turns: while the
                      aside sits above the list the terms run inline and the
                      marker is the rule under each label, as on the Insights
                      rail below its own sidebar; once the aside is a sidebar
                      at `2xl` they stack on hairlines and the marker returns
                      to the leading edge. Inline terms wrap rather than pan: a
                      page carries a handful, not a rail's worth. */}
                  <ul
                    aria-label={`${copy.label} shared by this work`}
                    className="flex flex-wrap items-center gap-x-6 2xl:flex-col 2xl:items-stretch 2xl:gap-x-0"
                  >
                    {filter.terms.map((term) => (
                      <li
                        className="relative flex items-center py-2 2xl:gap-3 2xl:border-t 2xl:border-border 2xl:pb-4"
                        key={term.slug}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-active 2xl:static 2xl:h-4 2xl:w-0.5 2xl:shrink-0"
                        />
                        {term.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                className="group pressable flex items-center gap-3 pt-2 text-lg"
                data-reveal
                href="/works"
                transitionTypes={[...forwardNavTransitionTypes]}
              >
                View all work
                <IconArrowUpRight
                  aria-hidden="true"
                  className="size-6 shrink-0 stroke-1 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                />
              </Link>
            </div>
          </ScrollReveal>

          {/* The strong rule opens the list, as the index strip's lower edge
              does; each row closes with the list's own hairline. */}
          <ul className="border-t border-foreground md:col-span-8 2xl:col-span-6">
            {items.map((item, index) => (
              <li className="border-b border-border" key={item.slug}>
                <ScrollReveal as="div" variant="underMedia">
                  <WorkRow highlight={highlight} index={index} item={item} titleAs="h3" />
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </BlockGrid>
      </Container>
    </Section>
  )
}
