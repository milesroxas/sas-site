import { describe, expect, it } from 'vitest'
import { blockText, findBlock, listBlocks, outline, rootField, withBlock } from './blocks'

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', text }] }],
  },
})

const doc = {
  id: 8,
  title: 'Privacy Policy',
  meta: { description: 'How we handle data', layout: [{ blockType: 'ghost', id: 'ghost' }] },
  hero: { heading: 'Privacy', body: paragraph('We keep little.') },
  layout: [
    {
      blockType: 'section',
      id: 's1',
      blockName: 'Intro',
      blocks: [
        { blockType: 'richText', id: 'r1', body: paragraph('First words of the policy.') },
        {
          blockType: 'faq',
          id: 'f1',
          items: [{ id: 'q1', question: 'Do you sell data?', answer: 'No.' }],
        },
      ],
    },
    { blockType: 'cta', id: 'c1', heading: 'Talk to us', link: { url: '/contact' } },
  ],
}

describe('listBlocks', () => {
  it('lists every block in document order with a dotted path', () => {
    expect(listBlocks(doc).map((row) => [row.path, row.id, row.blockType])).toEqual([
      ['layout.0', 's1', 'section'],
      ['layout.0.blocks.0', 'r1', 'richText'],
      ['layout.0.blocks.1', 'f1', 'faq'],
      ['layout.1', 'c1', 'cta'],
    ])
  })

  it('never looks inside meta', () => {
    expect(listBlocks(doc).some((row) => row.id === 'ghost')).toBe(false)
  })
})

describe('findBlock and withBlock', () => {
  it('finds a nested block by id', () => {
    expect(findBlock(doc, 'f1')?.path).toBe('layout.0.blocks.1')
    expect(findBlock(doc, 'nope')).toBeNull()
  })

  it('replaces one block and leaves the rest shared', () => {
    const next = { blockType: 'faq', id: 'f1', items: [] }
    const updated = withBlock(doc, 'layout.0.blocks.1', next)
    expect(findBlock(updated, 'f1')?.block).toBe(next)
    expect(findBlock(updated, 'r1')?.block).toBe(doc.layout[0]?.blocks?.[0])
    expect(updated.hero).toBe(doc.hero)
    expect(findBlock(doc, 'f1')?.block.items).toHaveLength(1)
  })

  it('names the field an update sends back', () => {
    expect(rootField('layout.0.blocks.1')).toBe('layout')
    expect(rootField('content.3')).toBe('content')
  })
})

describe('blockText and outline', () => {
  it("reads a block's own copy and skips nested blocks", () => {
    expect(blockText(doc.layout[1] as never)).toBe('Talk to us')
    expect(blockText(doc.layout[0] as never)).toBe('')
    expect(blockText(doc.layout[0]?.blocks?.[1] as never)).toBe('Do you sell data? No.')
  })

  it('renders rich text as words', () => {
    expect(blockText(doc.layout[0]?.blocks?.[0] as never)).toBe('First words of the policy.')
  })

  it('outlines with a snippet, a child count and no data', () => {
    expect(outline(doc)).toEqual([
      { path: 'layout.0', id: 's1', blockType: 'section', blockName: 'Intro', children: 2 },
      {
        path: 'layout.0.blocks.0',
        id: 'r1',
        blockType: 'richText',
        text: 'First words of the policy.',
      },
      { path: 'layout.0.blocks.1', id: 'f1', blockType: 'faq', text: 'Do you sell data? No.' },
      { path: 'layout.1', id: 'c1', blockType: 'cta', text: 'Talk to us' },
    ])
  })
})
