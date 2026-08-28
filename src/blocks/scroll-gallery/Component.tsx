import type React from 'react'
import { Section, type SectionTheme } from '@/blocks/shared/section'
import type {
  Media as MediaDoc,
  ScrollGalleryBlock as ScrollGalleryBlockProps,
} from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { ScrollGalleryClient, type ScrollGalleryEntry } from './Component.client'

/** The validated hex as stored, trimmed; empty stays undefined so the effect's default applies. */
const hex = (value: string | null | undefined) => value?.trim() || undefined

/**
 * Public-approved media documents from the block's items, paired with the
 * editor's palette. Anonymous visitors can't read other media, so an item
 * whose media the query left unpopulated (or not public) is dropped.
 */
export const resolveScrollGalleryEntries = (
  items: ScrollGalleryBlockProps['items'],
): ScrollGalleryEntry[] =>
  (items ?? []).flatMap((item, index) => {
    const media = populatedDoc<MediaDoc>(item.media)
    if (media?.usageStatus !== 'public-approved') return []
    return [
      {
        id: item.id ?? String(index),
        media,
        mood: {
          background: hex(item.mood?.background),
          blob1: hex(item.mood?.blob1),
          blob2: hex(item.mood?.blob2),
        },
      },
    ]
  })

export const ScrollGalleryBlock: React.FC<ScrollGalleryBlockProps> = ({
  eyebrow,
  heading,
  items,
  theme,
  id,
}) => {
  const entries = resolveScrollGalleryEntries(items)
  if (entries.length === 0) return null

  return (
    // The pinned client shell owns viewport sizing and its own containers, so
    // the section band carries no vertical padding of its own.
    <Section spacing="none" theme={(theme as SectionTheme | null) ?? 'dark'}>
      <div id={id ? `block-${id}` : undefined}>
        <ScrollGalleryClient entries={entries} eyebrow={eyebrow} heading={heading} />
      </div>
    </Section>
  )
}
