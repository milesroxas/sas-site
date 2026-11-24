import type React from 'react'
import type { PosterListBlock as PosterListBlockData } from '@/payload-types'
import { summaryParagraphs } from './item'
import { PosterListSection } from './PosterList.client'
import { resolvePosterItems } from './resolve-items'

type PosterListBlockProps = Pick<
  PosterListBlockData,
  'eyebrow' | 'heading' | 'itemSource' | 'items' | 'layout' | 'summary' | 'theme' | 'workPages'
> & { bare?: boolean }

/**
 * Server half of the Poster list: resolves either source into posters (Work
 * pages through the featured-work resolvers, published only outside draft
 * mode) and hands them to the client rail. `bare` skips the band for a
 * caller that painted it (a Section block).
 */
export const PosterListBlock: React.FC<PosterListBlockProps> = async ({
  bare,
  eyebrow,
  heading,
  itemSource,
  items,
  layout,
  summary,
  theme,
  workPages,
}) => {
  const posters = await resolvePosterItems({ itemSource, items, workPages })
  return (
    <PosterListSection
      bare={bare}
      eyebrow={eyebrow}
      heading={heading}
      items={posters}
      layout={layout ?? 'stacked'}
      paragraphs={summaryParagraphs(summary)}
      theme={theme}
    />
  )
}
