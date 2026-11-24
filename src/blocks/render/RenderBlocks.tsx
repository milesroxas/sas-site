import type React from 'react'
import { Fragment } from 'react'
import { AudienceTabsBlock } from '@/blocks/interactive/audience-tabs/Component'
import { IndustryWorkBlock } from '@/blocks/interactive/industry-work/Component'
import { TestimonialsMarqueeBlock } from '@/blocks/interactive/testimonials-marquee/Component'
import { ArchiveBlock } from '@/blocks/lists/archive/Component'
import { SectionBand } from '@/blocks/structure/section/SectionBand'
import type { Home, Page, PageSectionBlock, Post } from '@/payload-types'
import { renderContentBlock, sectionChildComponents } from './content-block-renderer'

/**
 * Every block this renderer can paint: the shared Section-nestable run plus
 * the blocks that only ever sit at the top level of a page.
 */
const blockComponents = {
  ...sectionChildComponents,
  archive: ArchiveBlock,
  audienceTabs: AudienceTabsBlock,
  industryWork: IndustryWorkBlock,
  testimonialsMarquee: TestimonialsMarqueeBlock,
} satisfies Record<ContentLayoutBlock['blockType'], unknown>

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
                stack={block.stack}
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
