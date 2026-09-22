import type { CollectionBeforeChangeHook, Config, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { headingInputsHash } from '@/blocks/shared/story-headings'
import type { StoryBody } from '@/collections/story/narrative'
import { type BeatJudge, storyHeadingsPlugin } from './index'

const copy = (text: string) =>
  ({
    root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
  }) as unknown as StoryBody

const project = {
  id: 3,
  approach: {
    body: copy('Overview'),
    storyBeats: [
      {
        key: 'one-object',
        heading: 'A collection is just a TypeScript object',
        body: copy('A collection is a TypeScript object.'),
      },
      {
        key: 'generated',
        heading: 'One object, everything generated',
        body: copy('From that one object Payload builds everything else.'),
      },
      {
        key: 'hub',
        heading: 'A Content Hub and a website',
        body: copy('The collections fall into two layers.'),
      },
    ],
  },
}

const fields = [
  { name: 'labProject', type: 'relationship', relationTo: 'lab-projects' },
  {
    name: 'layout',
    type: 'blocks',
    blocks: [
      {
        slug: 'section',
        fields: [{ name: 'blocks', type: 'blocks', blocks: [{ slug: 'storyBeats', fields: [] }] }],
      },
      { slug: 'storyBeats', fields: [] },
    ],
  },
]

const build = (judge: BeatJudge | null) => {
  const config = storyHeadingsPlugin({ judge: () => judge })({
    collections: [
      { slug: 'lab-pages', fields },
      { slug: 'plain', fields: [{ name: 'title', type: 'text' }] },
    ],
  } as unknown as Config) as Config
  const hooks = config.collections?.find((c) => c.slug === 'lab-pages')?.hooks?.beforeChange ?? []
  const plain = config.collections?.find((c) => c.slug === 'plain')?.hooks?.beforeChange ?? []
  return { hook: hooks[0] as CollectionBeforeChangeHook, hooks, plain }
}

const save = (
  hook: CollectionBeforeChangeHook,
  data: Record<string, unknown>,
  { autosave = false, originalDoc }: { autosave?: boolean; originalDoc?: unknown } = {},
) =>
  hook({
    collection: { slug: 'lab-pages', fields },
    data,
    originalDoc,
    req: {
      payload: { findByID: vi.fn(async () => project) },
      query: autosave ? { autosave: 'true' } : {},
    } as unknown as PayloadRequest,
  } as unknown as Parameters<CollectionBeforeChangeHook>[0])

const opener = (heading: string) => ({
  blockType: 'richTransition',
  layout: 'prose',
  heading,
  headingLevel: 'h2',
})
const beat = (id: string, key: string) => ({
  blockType: 'storyBeats',
  id,
  source: 'approach',
  storyScope: 'beat',
  storyBeatKey: key,
})

describe('storyHeadingsPlugin', () => {
  it('hooks only the collections that offer the Story beats block', () => {
    const { hooks, plain } = build(null)
    expect(hooks).toHaveLength(1)
    expect(plain).toHaveLength(0)
  })

  it('hides an exact restatement by code and asks Jev about the rest', async () => {
    const judge = vi.fn<BeatJudge>(async ({ beat_heading }) => ({
      restates: beat_heading.startsWith('A Content Hub') ? 0.9 : 0.1,
      weight: beat_heading.startsWith('One object') ? 'passage' : 'subsection',
    }))
    const { hook } = build(judge)
    const data = {
      labProject: 3,
      layout: [
        {
          blockType: 'section',
          blocks: [
            opener('A collection is just a TypeScript object'),
            beat('b1', 'one-object'),
            beat('b2', 'generated'),
          ],
        },
        {
          blockType: 'section',
          blocks: [opener('Two layers: a Content Hub and a website'), beat('b3', 'hub')],
        },
      ],
    }
    await save(hook, data)
    const [first, second] = (data.layout[0] as { blocks: Record<string, any>[] }).blocks.slice(1)
    const [third] = (data.layout[1] as { blocks: Record<string, any>[] }).blocks.slice(1)
    expect(first?.headingAuto['one-object']).toMatchObject({ level: 'h3', show: false })
    expect(second?.headingAuto.generated).toMatchObject({ level: 'h4', show: true })
    expect(third?.headingAuto.hub).toMatchObject({ level: 'h3', show: false })
    expect(judge).toHaveBeenCalledTimes(2)
    expect(judge.mock.calls[0]?.[0]).toEqual({
      section_heading: 'A collection is just a TypeScript object',
      beat_heading: 'One object, everything generated',
      beat_opening: 'From that one object Payload builds everything else.',
    })
  })

  it('reuses the saved answer while the hash matches, and never trusts the request', async () => {
    const judge = vi.fn<BeatJudge>(async () => ({ restates: 0.1, weight: 'subsection' }))
    const { hook } = build(judge)
    const hash = headingInputsHash(
      'A collection is just a TypeScript object',
      'One object, everything generated',
      'From that one object Payload builds everything else.',
    )
    const stored = { generated: { hash, level: 'h4', show: true } }
    const layout = [
      {
        blockType: 'section',
        blocks: [
          opener('A collection is just a TypeScript object'),
          {
            ...beat('b2', 'generated'),
            headingAuto: { generated: { hash: 'forged', level: 'h2', show: true } },
          },
        ],
      },
    ]
    await save(
      hook,
      { labProject: 3, layout },
      {
        originalDoc: {
          layout: [
            {
              blockType: 'section',
              blocks: [opener('x'), { ...beat('b2', 'generated'), headingAuto: stored }],
            },
          ],
        },
      },
    )
    expect((layout[0]?.blocks[1] as Record<string, any>).headingAuto).toEqual(stored)
    expect(judge).not.toHaveBeenCalled()
  })

  it('leaves a beat to the code rule when there is no judge, and skips autosave', async () => {
    const { hook } = build(null)
    const layout = [
      { blockType: 'section', blocks: [opener('Elsewhere'), beat('b2', 'generated')] },
    ]
    await save(hook, { labProject: 3, layout })
    expect((layout[0]?.blocks[1] as Record<string, any>).headingAuto).toEqual({})

    const untouched = [
      { blockType: 'section', blocks: [opener('Elsewhere'), beat('b2', 'generated')] },
    ]
    await save(hook, { labProject: 3, layout: untouched }, { autosave: true })
    expect((untouched[0]?.blocks[1] as Record<string, any>).headingAuto).toBeUndefined()
  })

  it('a block outside any Section prints its heading at the top of the scale', async () => {
    const { hook } = build(null)
    const layout = [beat('b1', 'one-object')]
    await save(hook, { labProject: 3, layout })
    expect((layout[0] as Record<string, any>).headingAuto).toEqual({
      'one-object': { hash: expect.any(String), level: 'h2', show: true },
    })
  })
})
