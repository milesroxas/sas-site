import type { Payload } from 'payload'
import { describe, expect, it } from 'vitest'
import { chunkMarkdown } from '@/features/ask/chunk'
import { extractDocMarkdown } from '@/shared/content/extract'
import type { ContentSurface } from '@/shared/content/surfaces'

/**
 * Pure-function coverage for the RAG corpus pipeline: markdown chunking and
 * document → markdown extraction. No Payload boot — the payload argument is
 * only touched on the canonical-record branch, which these fixtures avoid.
 */

const payloadStub = {} as unknown as Payload

const lexical = (...texts: string[]) => ({
  root: {
    children: texts.map((text) => ({
      type: 'paragraph',
      children: [{ type: 'text', text }],
    })),
  },
})

const richTextSurface: ContentSurface = {
  collection: 'posts',
  title: 'Insights',
  urlPrefix: '/posts',
  body: { kind: 'richText', field: 'content' },
}

const walkSurface: ContentSurface = {
  collection: 'pages',
  title: 'Pages',
  urlPrefix: '',
  homeSlug: 'home',
  body: { kind: 'walk' },
}

describe('chunkMarkdown', () => {
  it('keeps a small document as a single chunk', () => {
    const chunks = chunkMarkdown('# Title\n\nA short paragraph.')
    expect(chunks).toHaveLength(1)
    expect(chunks[0].index).toBe(0)
    expect(chunks[0].text).toContain('A short paragraph.')
  })

  it('splits on h2 boundaries and tracks the heading path', () => {
    const body = 'x'.repeat(600)
    const md = `# Doc\n\n${body}\n\n## Alpha\n\n${body}\n\n## Beta\n\n${body}`
    const chunks = chunkMarkdown(md)

    expect(chunks).toHaveLength(3)
    expect(chunks[0].headingPath).toEqual(['Doc'])
    expect(chunks[1].headingPath).toEqual(['Doc', 'Alpha'])
    expect(chunks[2].headingPath).toEqual(['Doc', 'Beta'])
    expect(chunks[1].text).toContain('## Alpha')
  })

  it('merges tiny sections instead of emitting fragments', () => {
    const md = `## Lonely heading\n\n## Next\n\n${'y'.repeat(400)}`
    const chunks = chunkMarkdown(md)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].text).toContain('Lonely heading')
    expect(chunks[0].text).toContain('## Next')
  })

  it('splits oversized sections on paragraph boundaries under the max size', () => {
    const paragraphs = Array.from({ length: 8 }, (_, i) => `${`p${i} `.repeat(150)}`.trim())
    const md = `## Big\n\n${paragraphs.join('\n\n')}`
    const chunks = chunkMarkdown(md)

    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(3_000)
      expect(chunk.headingPath).toEqual(['Big'])
    }
    expect(chunks.map((c) => c.index)).toEqual(chunks.map((_, i) => i))
  })

  it('ignores heading-looking lines inside code fences', () => {
    const md = `## Real\n\n\`\`\`md\n## Not a heading\n\`\`\`\n\n${'z'.repeat(300)}`
    const chunks = chunkMarkdown(md)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].headingPath).toEqual(['Real'])
  })
})

describe('extractDocMarkdown', () => {
  it('extracts title, meta description, and richText body for richText surfaces', async () => {
    const markdown = await extractDocMarkdown(payloadStub, richTextSurface, {
      title: 'A Post',
      meta: { description: 'What the post covers.' },
      content: lexical('Body paragraph one.', 'Body paragraph two.'),
    } as Parameters<typeof extractDocMarkdown>[2])

    expect(markdown).toContain('# A Post')
    expect(markdown).toContain('What the post covers.')
    expect(markdown).toContain('Body paragraph one.')
    expect(markdown).toContain('Body paragraph two.')
  })

  it('walks hero groups and layout blocks, keeping content and dropping noise', async () => {
    const markdown = await extractDocMarkdown(payloadStub, walkSurface, {
      title: 'Services',
      meta: { description: 'Page description.' },
      hero: {
        type: 'highImpact',
        richText: lexical('Hero copy about what we do.'),
        links: [{ link: { label: 'Learn more', url: '/contact' } }],
      },
      layout: [
        {
          blockType: 'content',
          theme: 'dark',
          columns: [{ richText: lexical('Column copy with substance.') }],
        },
        {
          blockType: 'cta',
          title: 'Work with us',
          internalNotes: 'Do not leak this.',
        },
      ],
    } as Parameters<typeof extractDocMarkdown>[2])

    expect(markdown).toContain('# Services')
    expect(markdown).toContain('Hero copy about what we do.')
    expect(markdown).toContain('Column copy with substance.')
    expect(markdown).toContain('## Work with us')

    expect(markdown).not.toContain('dark')
    expect(markdown).not.toContain('highImpact')
    expect(markdown).not.toContain('/contact')
    expect(markdown).not.toContain('Do not leak this.')
  })
})
