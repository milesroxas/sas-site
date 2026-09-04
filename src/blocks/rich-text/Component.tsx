import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type {
  RichTextBlock as RichTextBlockData,
  RichTextInsightsBlock as RichTextInsightsBlockData,
  RichTextPillListBlock as RichTextPillListBlockData,
} from '@/payload-types'
import { RichTextInsights } from './insights/Component'
import { RichTextPillList } from './pill-list/Component'

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or a renderer's reveal band).
 */
type RichTextBlockProps = Pick<RichTextBlockData, 'blockType' | 'body' | 'theme'> & {
  bare?: boolean
}

type Body = NonNullable<RichTextBlockData['body']>
type RootNode = Body['root']['children'][number]

/** The toolbar blocks this block lifts out of the prose onto its own grid. */
type BodyBlock = RichTextInsightsBlockData | RichTextPillListBlockData

const BODY_BLOCK_TYPES: ReadonlySet<string> = new Set<BodyBlock['blockType']>([
  'insights',
  'pillList',
])

/**
 * The body, split at every toolbar block: each run of prose nodes is one
 * cell, each block is one cell, all placed on the composition grid in
 * document order. Blocks are split out (not converted inline) so a run can
 * be wider than the prose (three or more Insights span two columns more) and
 * so each lands on its own reveal beat with the grid's row gap around it,
 * rather than inheriting Tailwind Typography's margins.
 */
type Segment = { kind: 'prose'; nodes: RootNode[] } | { kind: 'block'; fields: BodyBlock }

const isBodyBlockNode = (node: RootNode): node is RootNode & { fields: BodyBlock } =>
  node.type === 'block' &&
  typeof node.fields === 'object' &&
  node.fields !== null &&
  BODY_BLOCK_TYPES.has(String((node.fields as { blockType?: unknown }).blockType))

const segmentBody = (nodes: RootNode[]): Segment[] => {
  const segments: Segment[] = []
  let prose: RootNode[] = []
  const flush = () => {
    if (prose.length) segments.push({ kind: 'prose', nodes: prose })
    prose = []
  }
  for (const node of nodes) {
    if (isBodyBlockNode(node)) {
      flush()
      segments.push({ kind: 'block', fields: node.fields })
    } else {
      prose.push(node)
    }
  }
  flush()
  return segments
}

/** The Lexical state for one prose run, keeping the root's own attributes. */
const proseState = (body: Body, nodes: RootNode[]): DefaultTypedEditorState =>
  ({ ...body, root: { ...body.root, children: nodes } }) as DefaultTypedEditorState

/** One toolbar block as a grid cell. Insights place themselves by count. */
const renderBlock = (fields: BodyBlock, index: number) => {
  const key = fields.id ?? `${fields.blockType}-${index}`
  switch (fields.blockType) {
    case 'insights':
      return (
        <RichTextInsights
          className="md:col-start-3"
          group={`insights-${index}`}
          items={fields.items}
          key={key}
        />
      )
    case 'pillList':
      return (
        <RichTextPillList
          className="md:col-span-4 md:col-start-3"
          eyebrow={fields.eyebrow}
          items={fields.items}
          key={key}
        />
      )
  }
}

/**
 * A reading column on the composition grid: the body starts two columns in and
 * spans four (columns 3-6), a wider measure than the Standard heading body
 * (columns 2-4) so long-form copy gets room to breathe.
 *
 * Prose mode so inline headings, lists, and links take the article treatment
 * `RichText` bridges to the type tokens. Copy sits at the base size on a
 * normal desktop and steps up to `text-lg` from `xl`, where the four-column
 * measure is wide enough to carry it (the Paper frame is set at 1440).
 *
 * Blocks the editor adds from the toolbar interrupt the column as their own
 * cells. Insights: one fills the column, two share it, three or more open
 * out to column 8 (`insights/Component.tsx`). A Pill list stays in the
 * column (`pill-list/Component.tsx`). The grid's row gap is the only space
 * between a block and the copy around it.
 *
 * Each prose run and each block is a `data-reveal` marker for the shared
 * intro reveal the renderer plays; the block itself never animates.
 */
export const RichTextBlock: React.FC<RichTextBlockProps> = ({ bare, body, theme }) => (
  <Section bare={bare} theme={theme}>
    <Container>
      <BlockGrid>
        {body
          ? segmentBody(body.root.children).map((segment, index) =>
              segment.kind === 'prose' ? (
                <div className="md:col-span-4 md:col-start-3" data-reveal key={`prose-${index}`}>
                  <RichText
                    className="text-base xl:text-lg"
                    data={proseState(body, segment.nodes)}
                    enableGutter={false}
                  />
                </div>
              ) : (
                renderBlock(segment.fields, index)
              ),
            )
          : null}
      </BlockGrid>
    </Container>
  </Section>
)
