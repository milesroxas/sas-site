import type React from 'react'
import { Fragment } from 'react'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { AudienceTabsBlock } from '@/blocks/AudienceTabs/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { DynamicAudienceBlock } from '@/blocks/DynamicAudience/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { FeatureStatementGridBlock } from '@/blocks/feature/StatementGrid/Component'
import { FeatureStatementLinksBlock } from '@/blocks/feature/StatementLinks/Component'
import { FeatureTabsBlock } from '@/blocks/feature/Tabs/Component'
import { FeaturedWorkBlock } from '@/blocks/featured-work/Component'
import { IndustryWorkBlock } from '@/blocks/IndustryWork/Component'
import { NewsletterSignupBlock } from '@/blocks/NewsletterSignup/Component'
import { SectionBand } from '@/blocks/section/SectionBand'
import { TestimonialsMarqueeBlock } from '@/blocks/TestimonialsMarquee/Component'
import type { Home, Page, PageSectionBlock, Post } from '@/payload-types'
import { renderContentBlock, sectionChildComponents } from './shared/content-block-renderer'

/**
 * Every block this renderer can paint: the shared Section-nestable run plus
 * the blocks that only ever sit at the top level of a page.
 */
const blockComponents = {
  ...sectionChildComponents,
  archive: ArchiveBlock,
  audienceTabs: AudienceTabsBlock,
  carousel: CarouselBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  dynamicAudience: DynamicAudienceBlock,
  featureStatementGrid: FeatureStatementGridBlock,
  featureStatementLinks: FeatureStatementLinksBlock,
  featureTabs: FeatureTabsBlock,
  featuredWork: FeaturedWorkBlock,
  formBlock: FormBlock,
  industryWork: IndustryWorkBlock,
  newsletterSignup: NewsletterSignupBlock,
  testimonialsMarquee: TestimonialsMarqueeBlock,
}

type LayoutBlock =
  | NonNullable<Page['layout']>[number]
  | NonNullable<Home['layout']>[number]
  | NonNullable<Post['layout']>[number]

/** A block a Section can nest: always one of the flat content blocks above. */
type SectionChildBlock = NonNullable<PageSectionBlock['blocks']>[number]

type ContentLayoutBlock = Exclude<LayoutBlock, { blockType: 'section' }> | SectionChildBlock

const renderBlock = (block: ContentLayoutBlock, key: React.Key, bare: boolean) =>
  renderContentBlock(block, key, bare, blockComponents)

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
                  renderBlock(child, child.id ?? childIndex, true),
                )}
              </SectionBand>
            )
          }
          return renderBlock(block, index, false)
        })}
      </Fragment>
    )
  }

  return null
}
