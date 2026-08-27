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
import { FullMediaBlock } from '@/blocks/full-media/Component'
import { IndustryWorkBlock } from '@/blocks/IndustryWork/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { NewsletterSignupBlock } from '@/blocks/NewsletterSignup/Component'
import { SplitContentNarrowBlock } from '@/blocks/split-content/Component'
import { TestimonialsMarqueeBlock } from '@/blocks/TestimonialsMarquee/Component'
import { HomeFeaturedWorkBlock } from '@/Home/featured-work/Component'
import type { Home, Page } from '@/payload-types'
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
  formBlock: FormBlock,
  fullMedia: FullMediaBlock,
  homeFeaturedWork: HomeFeaturedWorkBlock,
  industryWork: IndustryWorkBlock,
  mediaBlock: MediaBlock,
  newsletterSignup: NewsletterSignupBlock,
  splitContentNarrow: SplitContentNarrowBlock,
  testimonialsMarquee: TestimonialsMarqueeBlock,
}

type LayoutBlock = NonNullable<Page['layout']>[number] | NonNullable<Home['layout']>[number]

/** GSAP variant for marker-carrying blocks (`'self'` = block owns its shell). */
const gsapReveal = (blockType: keyof typeof blockComponents) =>
  blockType in blockRevealVariants
    ? blockRevealVariants[blockType as RevealMappedBlockSlug]
    : undefined

export const RenderBlocks: React.FC<{
  blocks: LayoutBlock[] | null | undefined
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              const reveal = gsapReveal(blockType)

              // Blocks with their own GSAP shell — never add a second entrance.
              if (reveal === 'self') {
                return (
                  // @ts-expect-error there may be some mismatch between the expected types here
                  <Block key={index} {...block} disableInnerContainer />
                )
              }

              // Blocks carrying `data-reveal` markers play the shared GSAP
              // reveal here too, so the same CMS block moves identically on
              // Pages/Home and work pages.
              if (reveal) {
                return (
                  <ScrollReveal as="div" className="my-16" key={index} variant={reveal}>
                    {/* @ts-expect-error there may be some mismatch between the expected types here */}
                    <Block {...block} disableInnerContainer />
                  </ScrollReveal>
                )
              }

              return (
                <RevealSection className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </RevealSection>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
