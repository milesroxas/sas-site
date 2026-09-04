import type React from 'react'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import type { Capability, Industry } from '@/payload-types'
import type { WorksBrowseFilterOption, WorksBrowseItem } from '@/sections/WorksBrowse/queries'
import { type RelatedWorkCopyOverrides, resolveRelatedWorkCopy } from './copy'
import { RelatedWorkBrowse, type RelatedWorkCopy, type RelatedWorkKind } from './RelatedWorkBrowse'

export type RelatedWorkFilterKind = RelatedWorkKind

export type RelatedWorkFilter = {
  kind: RelatedWorkFilterKind
  /** The page's own terms: one filter each, and the slugs every row is read against. */
  terms: WorksBrowseFilterOption[]
}

/**
 * The filter's own copy per segment kind: it names the axis the rows are
 * read against, so it follows the kind rather than the page. The aside's
 * eyebrow, heading and body are `RELATED_WORK_DEFAULT_COPY`, which a page
 * may override line by line from its Positioning tab.
 */
const RELATED_WORK_FILTER_COPY = {
  capabilities: {
    filterLabel: 'Filter by capability',
    empty: 'No projects using this capability yet.',
  },
  industries: {
    filterLabel: 'Filter by industry',
    empty: 'No projects in this industry yet.',
  },
} as const satisfies Record<RelatedWorkFilterKind, Pick<RelatedWorkCopy, 'filterLabel' | 'empty'>>

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
 * works index, filtered by the page's own taxonomy. The server shell resolves
 * the copy and the section shell; the aside and list, which share a
 * filter selection, live in `RelatedWorkBrowse`.
 */
export const RelatedWorkSection: React.FC<{
  filter: RelatedWorkFilter
  /** The page's own lines for the aside; empty lines fall back to the standing copy. */
  copy?: RelatedWorkCopyOverrides | null
  items: WorksBrowseItem[]
}> = ({ filter, copy, items }) => {
  if (!items.length) return null

  return (
    <Section spacing="normal">
      <Container>
        <RelatedWorkBrowse
          copy={{ ...RELATED_WORK_FILTER_COPY[filter.kind], ...resolveRelatedWorkCopy(copy) }}
          items={items}
          kind={filter.kind}
          terms={filter.terms}
        />
      </Container>
    </Section>
  )
}
