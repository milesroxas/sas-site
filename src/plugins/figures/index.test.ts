import type { CollectionBeforeChangeHook, Config, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'
import { sectionBlock } from '@/blocks/section/config'
import { figureBlocks } from '@/blocks/shared/section-blocks'
import {
  BESPOKE_FIGURES,
  type DiagramSpec,
  type GraphLayout,
  layoutDiagram,
} from '@/features/figures'
import { CHART_CORPUS, DIAGRAM_CORPUS } from '@/features/figures/corpus'
import { figuresPlugin } from './index'

const Section = sectionBlock({ blocks: figureBlocks, interfaceName: 'TestSection' })

const config = figuresPlugin()({
  collections: [
    {
      slug: 'articles',
      fields: [{ name: 'layout', type: 'blocks', blocks: [Section, ...figureBlocks] }],
    },
    { slug: 'plain', fields: [{ name: 'title', type: 'text' }] },
  ],
} as unknown as Config) as Config

const hooksOf = (slug: string) =>
  config.collections?.find((collection) => collection.slug === slug)?.hooks?.beforeChange ?? []

const save = (
  data: Record<string, unknown>,
  { autosave = false, originalDoc }: { autosave?: boolean; originalDoc?: unknown } = {},
) => {
  const [hook] = hooksOf('articles') as CollectionBeforeChangeHook[]
  if (!hook) throw new Error('figuresPlugin attached no hook')
  return hook({
    collection: { slug: 'articles' },
    data,
    originalDoc,
    req: { query: autosave ? { autosave: 'true' } : {} } as unknown as PayloadRequest,
  } as unknown as Parameters<CollectionBeforeChangeHook>[0])
}

const chart = { blockType: 'chart', ...CHART_CORPUS.noiseCost }
const flow = DIAGRAM_CORPUS.admission
const flowSpec = flow?.spec as DiagramSpec
const diagram = { blockType: 'diagram', id: 'd1', ...flow }

describe('figuresPlugin', () => {
  it('hooks only the collections that offer a figure block, at any depth', () => {
    expect(hooksOf('articles')).toHaveLength(1)
    expect(hooksOf('plain')).toHaveLength(0)
  })

  it('reports every broken figure in one error, with the problem in the message', async () => {
    const data = {
      layout: [
        { blockType: 'chart', spec: { ...chart.spec, kind: 'scatter' } },
        { blockType: 'section', blocks: [{ ...diagram, spec: { ...flow?.spec, edges: [] } }] },
      ],
    }
    // The MCP tools relay `error.message` only, so the detail has to be in it.
    await expect(save(data)).rejects.toThrow(
      /layout\.0\.textAlternative \(is required.*layout\.0\.spec \(x\.type: a scatter chart needs x\.type number.*layout\.1\.blocks\.0\.spec \(edges: Too small/s,
    )
  })

  it('lets an autosave through with a broken spec, so typing is never fought', async () => {
    const data = { layout: [{ ...chart, spec: { ...chart.spec, kind: 'scatter' } }] }
    await expect(save(data, { autosave: true })).resolves.toBe(data)
  })

  it('lays a diagram out on save and stores the spec as parsed', async () => {
    const data = { layout: [{ ...diagram, spec: JSON.stringify(flow?.spec) }] }
    await save(data)
    expect(data.layout[0]).toMatchObject({
      geometry: await layoutDiagram(flowSpec),
      spec: flow?.spec,
    })
  })

  it('never takes geometry from the request', async () => {
    const forged = {
      hash: 'forged',
      version: 1,
      wide: { edges: [], groups: [], height: 1, nodes: [], width: 1 },
    }
    const data = { layout: [{ ...diagram, geometry: forged }] }
    await save(data)
    expect(data.layout[0]?.geometry).toEqual(await layoutDiagram(flowSpec))
  })

  it('reuses the saved geometry while the spec is unchanged', async () => {
    const computed = await layoutDiagram(flowSpec)
    // Marked, so a reused layout can be told from a recomputed one.
    const wide = computed?.wide as GraphLayout
    const saved = { ...computed, wide: { ...wide, width: wide.width + 1 } }
    const data = { layout: [{ ...diagram }] }
    await save(data, { originalDoc: { layout: [{ ...diagram, geometry: saved }] } })
    expect((data.layout[0] as { geometry?: unknown }).geometry).toEqual(saved)
  })

  it('keeps the last good geometry when an autosave carries a broken spec', async () => {
    const saved = await layoutDiagram(flowSpec)
    const data = { layout: [{ ...diagram, spec: { ...flow?.spec, edges: [] } }] }
    await save(data, { autosave: true, originalDoc: { layout: [{ ...diagram, geometry: saved }] } })
    expect((data.layout[0] as { geometry?: unknown }).geometry).toEqual(saved)
  })

  it('fills a bespoke figure’s text alternative from the registry, and checks its id and props', async () => {
    const id = 'streak-dash-anatomy-v1'
    const data = { layout: [{ blockType: 'bespokeFigure', figure: id, props: { tail: 0.5 } }] }
    await save(data)
    expect(data.layout[0]).toMatchObject({ textAlternative: BESPOKE_FIGURES[id].textAlternative })

    await expect(
      save({ layout: [{ blockType: 'bespokeFigure', figure: 'nope' }] }),
    ).rejects.toThrow(/layout\.0\.figure \(is not a registered figure/)
    await expect(
      save({ layout: [{ blockType: 'bespokeFigure', figure: id, props: { tail: 4 } }] }),
    ).rejects.toThrow(/layout\.0\.props \(tail: Too big/)
  })
})
