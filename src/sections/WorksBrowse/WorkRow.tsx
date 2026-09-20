import type React from 'react'
import { IndexRow, type IndexRowFact } from '@/sections/Browse/IndexRow'
import type { WorksBrowseItem } from './queries'

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

/**
 * A work page as an index row: client and lead industry on the facts line,
 * featured capabilities as the chips. The row itself is `IndexRow`.
 */
export const WorkRow: React.FC<{
  item: WorksBrowseItem
  index: number
  highlight?: WorkRowHighlight
  /** `h2` on the index, where a row is the page's unit; `h3` under a section heading. */
  titleAs?: 'h2' | 'h3'
}> = ({ item, index, highlight, titleAs }) => {
  const industry = item.industries[0]
  const facts: IndexRowFact[] = []
  if (item.client) facts.push({ label: item.client })
  if (industry) {
    facts.push({ label: industry.label, active: highlight?.industries?.includes(industry.slug) })
  }

  return (
    <IndexRow
      facts={facts}
      href={`/works/${item.slug}`}
      index={index}
      tags={item.capabilities.map((capability) => ({
        ...capability,
        active: highlight?.capabilities?.includes(capability.slug),
      }))}
      title={item.title}
      titleAs={titleAs}
      visual={item.visual}
    />
  )
}
