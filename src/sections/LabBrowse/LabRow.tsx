import type React from 'react'
import { IndexRow, type IndexRowFact } from '@/sections/Browse/IndexRow'
import type { LabBrowseItem } from './queries'

/**
 * A lab page as an index row: kind, lifecycle status and the byline on the
 * facts line, demonstrated capabilities as the chips. The row itself is
 * `IndexRow`.
 */
export const LabRow: React.FC<{
  item: LabBrowseItem
  index: number
  /** `h2` on the index, where a row is the page's unit; `h3` under a section heading. */
  titleAs?: 'h2' | 'h3'
}> = ({ item, index, titleAs }) => {
  const facts: IndexRowFact[] = []
  if (item.kind) facts.push({ label: item.kind.label })
  if (item.status) facts.push({ label: item.status })
  if (item.author) facts.push({ label: item.author })

  return (
    <IndexRow
      facts={facts}
      href={`/lab/${item.slug}`}
      index={index}
      tags={item.capabilities}
      title={item.title}
      titleAs={titleAs}
      visual={item.visual}
    />
  )
}
