import type React from 'react'
import { Fragment } from 'react'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { AudienceTabsBlock } from '@/blocks/AudienceTabs/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { DynamicAudienceBlock } from '@/blocks/DynamicAudience/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { FeatureHeadingOffsetBlock } from '@/blocks/feature/HeadingOffset/Component'
import { FeatureImageStatementBlock } from '@/blocks/feature/ImageStatement/Component'
import { FeatureStatementGridBlock } from '@/blocks/feature/StatementGrid/Component'
import { FeatureStatementLinksBlock } from '@/blocks/feature/StatementLinks/Component'
import { FeatureTabsBlock } from '@/blocks/feature/Tabs/Component'
import { FeaturedWorkBlock } from '@/blocks/featured-work/Component'
import { FullMediaBlock } from '@/blocks/full-media/Component'
import { IndustryWorkBlock } from '@/blocks/IndustryWork/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { MediaContentSplitBlock } from '@/blocks/media-content-split/Component'
import { NewsletterSignupBlock } from '@/blocks/NewsletterSignup/Component'
import { SectionBand } from '@/blocks/section/SectionBand'
import { SplitContentNarrowBlock } from '@/blocks/split-content/Component'
import { TestimonialsMarqueeBlock } from '@/blocks/TestimonialsMarquee/Component'
import type { Home, Page, PageSectionBlock } from '@/payload-types'
import { RevealSection } from '@/shared/ui/reveal-section'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { blockRevealVariants, type RevealMappedBlockSlug } from './shared/reveal-variants'

const blockComponents = {
  archive: ArchiveBlock,
  audienceTabs: AudienceTabsBlock,
  carousel: CarouselBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  dynamicAudience: DynamicAudienceBlock,
  featureHeadingOffset: FeatureHeadingOffsetBlock,
  featureImageStatement: FeatureImageStatementBlock,
  featureStatementGrid: FeatureStatementGridBlock,
  featureStatementLinks: FeatureStatementLinksBlock,
  featureTabs: FeatureTabsBlock,
  featuredWork: FeaturedWorkBlock,
  formBlock: FormBlock,
  fullMedia: FullMediaBlock,
  industryWork: IndustryWorkBlock,
  mediaBlock: MediaBlock,
  mediaContentSplit: MediaContentSplitBlock,
  newsletterSignup: NewsletterSignupBlock,
  splitContentNarrow: SplitContentNarrowBlock,
  testimonialsMarquee: TestimonialsMarqueeBlock,
}

type LayoutBlock = NonNullable<Page['layout']>[number] | NonNullable<Home['layout']>[number]

/** A block a Section can nest: always one of the flat content blocks above. */
type SectionChildBlock = NonNullable<PageSectionBlock['blocks']>[number]

type ContentLayoutBlock = Exclude<LayoutBlock, { blockType: 'section' }> | SectionChildBlock

/** GSAP variant for marker-carrying blocks (`'self'` = block owns its shell). */
const gsapReveal = (blockType: keyof typeof blockComponents) =>
  blockType in blockRevealVariants
    ? blockRevealVariants[blockType as RevealMappedBlockSlug]
    : undefined

/**
 * One flat content block with its entrance. `bare` is set for blocks nested
 * inside a Section block: the block skips its own band (the Section painted
 * it) but keeps the same reveal wrapper it has at the top level, so a block
 * moves identically inside and outside a Section.
 */
const renderContentBlock = (block: ContentLayoutBlock, key: React.Key, bare: boolean) => {
  const { blockType } = block

  if (!blockType || !(blockType in blockComponents)) return null
  const Block = blockComponents[blockType as keyof typeof blockComponents]
  if (!Block) return null

  const reveal = gsapReveal(blockType as keyof typeof blockComponents)

  // Blocks with their own GSAP shell — never add a second entrance.
  if (reveal === 'self') {
    return (
      // @ts-expect-error there may be some mismatch between the expected types here
      <Block key={key} {...block} disableInnerContainer />
    )
  }

  // Blocks carrying `data-reveal` markers play the shared GSAP
  // reveal here too, so the same CMS block moves identically on
  // Pages/Home and work pages. Spacing is the block's own band —
  // the wrapper never adds margin.
  if (reveal) {
    return (
      <ScrollReveal as="div" key={key} variant={reveal}>
        {/* @ts-expect-error there may be some mismatch between the expected types here */}
        <Block {...block} bare={bare || undefined} disableInnerContainer />
      </ScrollReveal>
    )
  }

  return (
    <RevealSection key={key}>
      {/* @ts-expect-error there may be some mismatch between the expected types here */}
      <Block {...block} bare={bare || undefined} disableInnerContainer />
    </RevealSection>
  )
}

export const RenderBlocks: React.FC<{
  blocks: LayoutBlock[] | null | undefined
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          // The Section block owns the band; children render bare inside it
          // with their usual entrances. The band itself never animates: a
          // second entrance on the shell would double every child's motion.
          if (block.blockType === 'section') {
            return (
              <SectionBand
                customize={block.customize}
                key={block.id ?? index}
                spacing={block.spacing}
                theme={block.theme}
              >
                {(block.blocks ?? []).map((child, childIndex) =>
                  renderContentBlock(child, child.id ?? childIndex, true),
                )}
              </SectionBand>
            )
          }
          return renderContentBlock(block, index, false)
        })}
      </Fragment>
    )
  }

  return null
}
