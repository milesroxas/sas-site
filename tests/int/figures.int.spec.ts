import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BESPOKE_FIGURES, type DiagramSpec, layoutDiagram } from '@/features/figures'
import { CHART_CORPUS, DIAGRAM_CORPUS } from '@/features/figures/corpus'
import config from '@/payload.config'
import type { Page, User } from '@/payload-types'

/**
 * The agent authoring path end to end, against the real config: a draft Page
 * written as a team user with access control on, the way the MCP server writes
 * (docs/figures.md). Covers the Phase 1 gate (prose and code over a draft, a
 * second write cannot overwrite a person's edits without `replace`) and the
 * save-time half of Phases 2 to 4 (specs validated on a draft, diagrams laid
 * out, bespoke figures checked against the registry).
 */

const suffix = `figures-${Date.now()}`
const MARKDOWN = [
  '## Why the field is cheap',
  'Each streak is one instanced quad, so `count` costs vertices, **not** draw calls.',
  '- The CPU advances time',
  '- The GPU does the rest',
].join('\n\n')

type Section = Extract<NonNullable<Page['layout']>[number], { blockType: 'section' }>
type Child = NonNullable<Section['blocks']>[number]

const flow = DIAGRAM_CORPUS.visualResolves
const chart = CHART_CORPUS.frameTimeByCount

describe.sequential('figures and Markdown authoring over a draft', () => {
  let payload: Payload
  let user: User
  let page: Page

  const child = <T extends Child['blockType']>(doc: Page, blockType: T) => {
    const section = doc.layout?.find((block): block is Section => block.blockType === 'section')
    return section?.blocks?.find(
      (block): block is Extract<Child, { blockType: T }> => block.blockType === blockType,
    )
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    user = await payload.create({
      collection: 'users',
      data: { email: `${suffix}@example.com`, password: 'testing123' },
    })
  })

  afterAll(async () => {
    if (!payload || !user) return
    await payload.delete({
      collection: 'pages',
      where: { slug: { contains: suffix } },
      context: { disableRevalidate: true },
    })
    await payload.delete({ collection: 'users', id: user.id })
  })

  // Guards patches/@payloadcms__drizzle.patch. Unpatched, Payload counts the
  // virtual `markdown` and `replace` fields as missing columns, fails its
  // identical-block check on the Rich text block's second use in a collection
  // (top level, then inside a Section) and gives it a second table. Existing
  // Section rich text would then be read from an empty `*_rich_text_2`.
  it('keeps a block with virtual fields in one table, however often a collection offers it', () => {
    const tables = Object.keys(
      (payload.db as unknown as { tables: Record<string, unknown> }).tables,
    )
    expect(tables).toContain('pages_rich_text')
    expect(tables.filter((name) => /_rich_text(_v)?_\d+$/.test(name))).toEqual([])
  })

  it('creates a long-form draft from Markdown, code and three figure specs', async () => {
    page = await payload.create({
      collection: 'pages',
      user,
      overrideAccess: false,
      draft: true,
      data: {
        title: `Streak Field ${suffix}`,
        slug: suffix,
        layout: [
          {
            blockType: 'section',
            blocks: [
              { blockType: 'richText', markdown: MARKDOWN },
              { blockType: 'code', language: 'glsl', code: 'float h = fbm(p * uScale);' },
              { blockType: 'chart', ...chart },
              { blockType: 'diagram', ...flow },
              {
                blockType: 'bespokeFigure',
                figure: 'streak-dash-anatomy-v1',
                props: { tail: 0.6 },
              },
            ],
          },
        ],
      } as never,
    })

    expect(page._status).toBe('draft')

    // Markdown became Lexical, with the nodes the editor enables, and was not stored.
    const richText = child(page, 'richText')
    const nodes = richText?.body?.root.children.map((node) => node.type)
    expect(nodes).toEqual(['heading', 'paragraph', 'list'])
    expect(JSON.stringify(richText?.body)).toContain('"format":16') // inline code
    expect(richText).not.toHaveProperty('markdown', MARKDOWN)

    expect(child(page, 'code')).toMatchObject({ language: 'glsl' })
    expect(child(page, 'chart')?.spec).toEqual(chart?.spec)
    // Laid out on save, from the spec alone.
    expect(child(page, 'diagram')?.geometry).toEqual(await layoutDiagram(flow?.spec as DiagramSpec))
    expect(child(page, 'bespokeFigure')?.textAlternative).toBe(
      BESPOKE_FIGURES['streak-dash-anatomy-v1'].textAlternative,
    )
  })

  it('will not let a second Markdown write replace the body without replace: true', async () => {
    const section = page.layout?.[0] as Section
    const withMarkdown = (extra: Record<string, unknown>) => ({
      layout: [
        {
          ...section,
          blocks: section.blocks?.map((block) =>
            block.blockType === 'richText' ? { ...block, markdown: 'Rewritten.', ...extra } : block,
          ),
        },
      ],
    })
    const update = (extra: Record<string, unknown>) =>
      payload.update({
        collection: 'pages',
        id: page.id,
        user,
        overrideAccess: false,
        draft: true,
        data: withMarkdown(extra) as never,
      })

    await expect(update({})).rejects.toThrow(/already has content.*"replace": true/)

    const replaced = await update({ replace: true })
    expect(JSON.stringify(child(replaced, 'richText')?.body)).toContain('Rewritten.')
  })

  it('answers a broken spec on a draft save, with the path and the fix in the message', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        user,
        overrideAccess: false,
        draft: true,
        data: {
          title: `Broken ${suffix}`,
          slug: `${suffix}-broken`,
          layout: [
            {
              blockType: 'chart',
              ...chart,
              spec: { ...chart?.spec, kind: 'scatter', x: { key: 'count', type: 'category' } },
            },
          ],
        } as never,
      }),
    ).rejects.toThrow(/layout\.0\.spec \(x\.type: a scatter chart needs x\.type number/)
  })
})
