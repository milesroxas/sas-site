import { describe, expect, it, vi } from 'vitest'
import type { OutlineRow } from './blocks'
import { LOCATE_MAX_BLOCKS, locateInOutline, locateQuestions, outlineState } from './locate'

const rows: OutlineRow[] = [
  { path: 'layout.0', id: 's1', blockType: 'section', blockName: 'Intro', children: 2 },
  { path: 'layout.0.blocks.0', id: 'r1', blockType: 'richText', text: 'First words.' },
  { path: 'layout.0.blocks.1', id: 'f1', blockType: 'faq', text: 'Do you sell data? No.' },
  { path: 'layout.1', id: 'c1', blockType: 'cta', text: 'Talk to us' },
]

const answer = (probabilities: Record<string, number>, confidence: number, exists: number) => ({
  systemOne: vi.fn().mockResolvedValue({
    model: 'jev-test',
    usage: { input_tokens: 321, output_tokens: 8 },
    answers: {
      where: { type: 'choice', choice: 'B02', confidence, probabilities },
      exists: { type: 'noul', noul: exists },
    },
  }),
})

describe('outlineState', () => {
  it('writes one tagged line per block with its nesting and copy', () => {
    expect(outlineState(rows)).toBe(
      [
        'B00| section "Intro" [2 blocks inside]',
        'B01| richText (inside B00) : First words.',
        'B02| faq (inside B00) : Do you sell data? No.',
        'B03| cta : Talk to us',
      ].join('\n'),
    )
  })

  it('offers one option per block and names the instruction in both questions', () => {
    const q = locateQuestions('reword the FAQ')(rows)
    expect(Object.keys(q.where.criteria)).toEqual(['B00', 'B01', 'B02', 'B03'])
    expect(q.where.instructions).toContain('"reword the FAQ"')
    expect(q.exists.instructions).toContain('"reword the FAQ"')
  })
})

describe('locateInOutline', () => {
  it('ranks the blocks by probability and says found when both signals agree', async () => {
    const jev = answer({ B00: 0.01, B01: 0.05, B02: 0.9, B03: 0.04 }, 0.87, 0.96)
    const out = await locateInOutline(jev, rows, 'reword the FAQ')
    expect(out.verdict).toBe('found')
    expect(out.candidates.map((c) => c.id)).toEqual(['f1', 'r1', 'c1', 's1'])
    expect(out.candidates[0]).toMatchObject({ probability: 0.9, path: 'layout.0.blocks.1' })
    expect(out).toMatchObject({ exists: 0.96, confidence: 0.87, omitted: 0, inputTokens: 321 })
    expect(jev.systemOne).toHaveBeenCalledWith(
      expect.objectContaining({ state: { document: outlineState(rows) } }),
    )
  })

  it('says none when the Noul is low, whatever the Choice crowned', async () => {
    const jev = answer({ B00: 0.1, B01: 0.2, B02: 0.6, B03: 0.1 }, 0.5, 0.08)
    const out = await locateInOutline(jev, rows, 'reword the pricing table')
    expect(out.verdict).toBe('none')
    expect(out.candidates[0]?.id).toBe('f1')
  })

  it('says unsure when the Choice is split', async () => {
    const jev = answer({ B00: 0.05, B01: 0.45, B02: 0.45, B03: 0.05 }, 0.3, 0.9)
    const out = await locateInOutline(jev, rows, 'reword the block')
    expect(out.verdict).toBe('unsure')
  })

  it('offers at most the Choice limit and counts the rest as omitted', async () => {
    const many: OutlineRow[] = Array.from({ length: LOCATE_MAX_BLOCKS + 3 }, (_, i) => ({
      path: `layout.${i}`,
      id: `b${i}`,
      blockType: 'cta',
      text: `Block ${i}`,
    }))
    const jev = answer({ B00: 1 }, 1, 1)
    const out = await locateInOutline(jev, many, 'x')
    expect(out.omitted).toBe(3)
    const sent = jev.systemOne.mock.calls[0]?.[0] as { questions: { where: { criteria: object } } }
    expect(Object.keys(sent.questions.where.criteria)).toHaveLength(LOCATE_MAX_BLOCKS)
  })
})
