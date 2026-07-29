import type React from 'react'
import { Fragment } from 'react'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { FeatureHeadingOffsetBlock } from '@/blocks/feature/HeadingOffset/Component'
import { FeatureImageStatementBlock } from '@/blocks/feature/ImageStatement/Component'
import { FeatureStatementGridBlock } from '@/blocks/feature/StatementGrid/Component'
import { FeatureTabsBlock } from '@/blocks/feature/Tabs/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { NewsletterSignupBlock } from '@/blocks/NewsletterSignup/Component'
import { SplitContentNarrowBlock } from '@/blocks/split-content/Component'
import type { Home, Page } from '@/payload-types'
import { RevealSection } from '@/shared/ui/reveal-section'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  featureHeadingOffset: FeatureHeadingOffsetBlock,
  featureImageStatement: FeatureImageStatementBlock,
  featureStatementGrid: FeatureStatementGridBlock,
  featureTabs: FeatureTabsBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  newsletterSignup: NewsletterSignupBlock,
  splitContentNarrow: SplitContentNarrowBlock,
}

type LayoutBlock = NonNullable<Page['layout']>[number] | NonNullable<Home['layout']>[number]

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
              return (
                <RevealSection className="my-16" delayMs={Math.min(index * 72, 420)} key={index}>
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
