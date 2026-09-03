import type React from 'react'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import type { Capability, Industry } from '@/payload-types'
import type { WorksBrowseFilterOption, WorksBrowseItem } from '@/sections/WorksBrowse/queries'
import { RelatedWorkBrowse, type RelatedWorkCopy, type RelatedWorkKind } from './RelatedWorkBrowse'

export type RelatedWorkFilterKind = RelatedWorkKind

export type RelatedWorkFilter = {
  kind: RelatedWorkFilterKind
  /** The page's own terms: one filter each, and the slugs every row is read against. */
  terms: WorksBrowseFilterOption[]
}

/**
 * Standing copy per segment kind. Site voice rather than CMS: what the block
 * *lists* is the Positioning tab's job, this is the one sentence that tells a
 * reader why the list is worth reading, and it is the same on every page of a
 * kind. Reader-facing throughout: a Who We Help page proves *who* the work
 * was for, an Expertise page proves *what* was done.
 */
const RELATED_WORK_COPY = {
  capabilities: {
    heading: 'In practice',
    description: 'Case studies where this work was central.',
    filterLabel: 'Filter by capability',
    empty: 'No projects using this capability yet.',
  },
  industries: {
    heading: 'Companies like yours',
    description: 'A few case studies from clients in this space.',
    filterLabel: 'Filter by industry',
    empty: 'No projects in this industry yet.',
  },
} as const satisfies Record<RelatedWorkFilterKind, RelatedWorkCopy>

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
 * the standing copy and the section shell; the aside and list, which share a
 * filter selection, live in `RelatedWorkBrowse`.
 */
export const RelatedWorkSection: React.FC<{
  filter: RelatedWorkFilter
  /** Overrides the standing heading for the kind. */
  heading?: string
  items: WorksBrowseItem[]
}> = ({ filter, heading, items }) => {
  if (!items.length) return null

  const copy = RELATED_WORK_COPY[filter.kind]

  return (
    <Section spacing="normal">
      <Container>
        <RelatedWorkBrowse
          copy={{ ...copy, heading: heading ?? copy.heading }}
          items={items}
          kind={filter.kind}
          terms={filter.terms}
        />
      </Container>
    </Section>
  )
}
