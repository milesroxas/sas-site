import type React from 'react'
import type { BandTheme } from '@/blocks/shared/band-theme'
import { Section } from '@/blocks/shared/section'
import type { FeaturedWorkBlock as FeaturedWorkBlockProps } from '@/payload-types'
import type { FeaturedEntry } from './entry'
import { FeaturedWorkList } from './FeaturedWorkList.client'
import { resolveFeaturedWorkEntries } from './resolve-entries'

export const FeaturedWorkSection: React.FC<{
  eyebrow?: string | null
  entries: FeaturedEntry[]
  /** Names what the media frame opens, for its accessible label. */
  frameLabel?: string
  theme?: BandTheme | null
  id?: string | null
}> = ({ eyebrow, entries, frameLabel, theme, id }) => {
  if (entries.length === 0) return null

  return (
    // The pinned client shell owns viewport sizing and its own containers, so
    // the section band carries no vertical padding of its own.
    <Section spacing="none" theme={theme}>
      <div id={id ? `block-${id}` : undefined}>
        <FeaturedWorkList eyebrow={eyebrow} entries={entries} frameLabel={frameLabel} />
      </div>
    </Section>
  )
}

export const FeaturedWorkBlock: React.FC<FeaturedWorkBlockProps> = async ({
  eyebrow,
  entries,
  theme,
  id,
}) => {
  const resolved = await resolveFeaturedWorkEntries(entries ?? [])
  return <FeaturedWorkSection eyebrow={eyebrow} entries={resolved} id={id} theme={theme} />
}
