import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  AVOID_FRAMES,
  AVOID_PHRASES,
  EM_DASH,
  emDashesIn,
  FLATTENED_CLAIMS,
  gateFindings,
  lintVoice,
  sentenceSpread,
  VOICE_PROMPT_LINE,
} from './voice'

const doc = readFileSync(join(process.cwd(), 'docs/editorial/voice.md'), 'utf8')

/** The bullet items under one `##` heading of the doc. */
const listUnder = (heading: string): string[] => {
  const start = doc.indexOf(`## ${heading}`)
  if (start === -1) throw new Error(`voice.md has no "${heading}" section`)
  const end = doc.indexOf('\n## ', start + 1)
  return (end === -1 ? doc.slice(start) : doc.slice(start, end))
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
}

describe('voice.md and voice.ts hold the same rules', () => {
  it('lists the same language to avoid, in the same order', () => {
    expect([...AVOID_PHRASES]).toEqual(listUnder('Language to avoid'))
  })

  it('lists the same flattened claims', () => {
    expect([...FLATTENED_CLAIMS]).toEqual(listUnder('Do not flatten'))
  })

  it('catches every construction the doc gives as an example', () => {
    for (const example of listUnder('Constructions to avoid')) {
      const caught = AVOID_FRAMES.some(({ pattern }) => pattern.test(example))
      expect(caught, example).toBe(true)
    }
  })
})

describe('gateFindings', () => {
  it('finds an em dash, and lets a numeric range keep one', () => {
    expect(emDashesIn(`The depth stays${EM_DASH}the order changes.`)).toEqual([15])
    expect(emDashesIn(`Budgets of 50${EM_DASH}100K.`)).toEqual([])
    expect(gateFindings(`A${EM_DASH}B`)).toEqual([{ rule: 'em-dash', match: EM_DASH, index: 1 }])
  })

  it('finds a banned phrase whole, in any case, and not inside a longer word', () => {
    expect(gateFindings('We Elevate the brand.').map((f) => f.match)).toEqual(['elevate'])
    expect(gateFindings('The row was unlocked at noon.')).toEqual([])
    expect(gateFindings('A cutting-edge, best-in-class stack.').map((f) => f.match)).toEqual([
      'cutting-edge',
      'best-in-class',
    ])
  })

  it("reads a curly apostrophe as the doc's straight one", () => {
    expect(gateFindings('In today’s fast-paced world, brands move.').map((f) => f.match)).toEqual([
      "in today's fast-paced world",
    ])
  })

  it('finds nothing in copy that follows the doc', () => {
    expect(gateFindings('Make the difference visible. Give people somewhere to start.')).toEqual([])
  })
})

describe('lintVoice', () => {
  it('allows one contrast frame and lists two', () => {
    const one = 'It is not just a site. It is a system.'
    expect(lintVoice(one).filter((f) => f.rule === 'contrast-frame')).toEqual([])
    const two = `${one} Whether you are a founder or a team, it fits.`
    expect(
      lintVoice(two)
        .filter((f) => f.rule === 'contrast-frame')
        .map((f) => f.match),
    ).toEqual(['not just X, it is Y', 'whether you are X or Y'])
  })

  it('does not read a date range or an ordinary "from" as a frame', () => {
    const text = 'From 2019 to 2024 the team grew. We moved the copy from the page to the record.'
    expect(AVOID_FRAMES.some(({ pattern }) => pattern.test(text))).toBe(false)
  })

  it('counts semicolons and words', () => {
    expect(lintVoice('One; two; three.').map((f) => f.rule)).toEqual(['semicolons'])
    const long = Array.from({ length: 140 }, () => 'word').join(' ')
    expect(lintVoice(`${long}.`).map((f) => f.rule)).toEqual(['long-paragraph'])
  })

  it('lists sentences that all run to one length', () => {
    const uniform = 'The plan was set. The team was ready. The site was live. The client was glad.'
    expect(sentenceSpread(uniform)).toEqual({ count: 4, spread: 0 })
    expect(lintVoice(uniform).map((f) => f.rule)).toEqual(['uniform-sentences'])
    const varied =
      'The plan was set. Then the team, three of them and a contractor, rebuilt the site over a long spring. It went live. The client was glad.'
    expect(lintVoice(varied)).toEqual([])
  })

  it('finds a flattened claim without its full stop', () => {
    expect(lintVoice('We help brands stand out, and more.').map((f) => f.rule)).toEqual([
      'flattened-claim',
    ])
  })
})

describe('VOICE_PROMPT_LINE', () => {
  it('holds no em dash and names the first banned words', () => {
    expect(VOICE_PROMPT_LINE).not.toContain(EM_DASH)
    expect(VOICE_PROMPT_LINE).toContain('elevate')
  })
})
