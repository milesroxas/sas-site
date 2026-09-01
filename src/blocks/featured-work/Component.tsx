import type React from 'react'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import { Section, type SectionTheme } from '@/blocks/shared/section'
import type { FeaturedWorkBlock as FeaturedWorkBlockProps } from '@/payload-types'
import { FeaturedWorkList } from './FeaturedWorkList.client'
import { resolveFeaturedWorkEntries } from './resolve-entries'

export const FeaturedWorkSection: React.FC<{
  eyebrow?: string | null
  entries: WorkEntry[]
  theme?: SectionTheme | null
  id?: string | null
}> = ({ eyebrow, entries, theme, id }) => {
  if (entries.length === 0) return null

  return (
    // The pinned client shell owns viewport sizing and its own containers, so
    // the section band carries no vertical padding of its own.
    <Section spacing="none" theme={theme ?? 'light'}>
      <div id={id ? `block-${id}` : undefined}>
        <FeaturedWorkList eyebrow={eyebrow} entries={entries} />
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
  return (
    <FeaturedWorkSection
      eyebrow={eyebrow}
      entries={resolved}
      id={id}
      theme={theme as SectionTheme | null}
    />
  )
}
