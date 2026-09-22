import { describe, expect, it } from 'vitest'
import type { StoryBody, StoryRecord } from '@/collections/story/narrative'
import {
  beatHeading,
  headingInputsHash,
  restatesOpener,
  sectionOpener,
  stepDown,
  storyBeatPassages,
} from './story-headings'

const copy = (text: string) =>
  ({
    root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
  }) as unknown as StoryBody

const overview = copy('Approach overview')
const first = copy('A collection is a TypeScript object. Give it a slug and some fields.')
const second = copy('From that one object Payload builds everything else.')

const record: StoryRecord = {
  approach: {
    body: overview,
    storyBeats: [
      {
        key: 'one-object',
        label: 'One object',
        heading: 'A collection is just a TypeScript object',
        body: first,
      },
      {
        key: 'generated',
        label: 'Generated',
        heading: 'One object, everything generated',
        body: second,
      },
      {
        key: 'unheaded',
        label: 'Unheaded',
        heading: null,
        body: copy('No heading on the record.'),
      },
    ],
  },
}

const opener = { heading: 'A collection is just a TypeScript object', level: 'h2' as const }

describe('stepDown and restatesOpener', () => {
  it('steps down the prose scale and stops at its last level', () => {
    expect(stepDown('h2', 1)).toBe('h3')
    expect(stepDown('h2', 2)).toBe('h4')
    expect(stepDown('h3', 2)).toBe('h4')
    expect(stepDown('h4', 1)).toBe('h4')
  })

  it('reads an exact repeat past case and punctuation, and nothing else', () => {
    expect(restatesOpener('Sections own the rhythm.', 'sections own the rhythm')).toBe(true)
    expect(
      restatesOpener('Two layers: a Content Hub and a website', 'A Content Hub and a website'),
    ).toBe(false)
    expect(restatesOpener(undefined, 'Anything')).toBe(false)
  })
})

describe('sectionOpener', () => {
  it('finds the first Prose heading and resolves its heading and level', () => {
    const children = [
      { blockType: 'storyBeats', source: 'approach' as const, storyScope: 'beat' as const },
      {
        blockType: 'richTransition',
        layout: 'prose',
        heading: '',
        source: 'approach' as const,
        storyScope: 'overview' as const,
        headingLevel: 'h3',
      },
      { blockType: 'richTransition', layout: 'prose', heading: 'Later', headingLevel: 'h2' },
    ]
    expect(sectionOpener(children, record)).toEqual({ heading: 'Approach', level: 'h3' })
  })

  it('ignores other Standard heading layouts and answers null without one', () => {
    expect(
      sectionOpener([{ blockType: 'richTransition', layout: 'centered', heading: 'X' }], record),
    ).toBeNull()
    expect(sectionOpener([], record)).toBeNull()
  })
})

describe('beatHeading', () => {
  const beat = { body: second, heading: 'One object, everything generated' }

  it('prints the record heading one level under the opener by default', () => {
    expect(beatHeading(beat, opener, undefined)).toEqual({
      heading: 'One object, everything generated',
      headingLevel: 'h3',
    })
    expect(beatHeading(beat, null, undefined)).toEqual({
      heading: 'One object, everything generated',
      headingLevel: 'h2',
    })
  })

  it('hides an exact restatement of the opener, and prints nothing for an unheaded beat', () => {
    expect(
      beatHeading(
        { body: first, heading: 'A collection is just a TypeScript object' },
        opener,
        undefined,
      ),
    ).toEqual({ headingLevel: 'h3' })
    expect(beatHeading({ body: first, heading: '' }, opener, undefined)).toEqual({
      headingLevel: 'h3',
    })
  })

  it('takes a stored judgment only while its hash matches what it read', () => {
    const hash = headingInputsHash(
      opener.heading,
      beat.heading,
      'From that one object Payload builds everything else.',
    )
    expect(beatHeading(beat, opener, { hash, level: 'h4', show: true })).toEqual({
      heading: 'One object, everything generated',
      headingLevel: 'h4',
    })
    expect(beatHeading(beat, opener, { hash, level: 'h3', show: false })).toEqual({
      headingLevel: 'h3',
    })
    expect(beatHeading(beat, opener, { hash: 'stale', level: 'h4', show: false })).toEqual({
      heading: 'One object, everything generated',
      headingLevel: 'h3',
    })
  })
})

describe('storyBeatPassages', () => {
  it('under beat scope: one passage, the record heading unless the page overrides it', () => {
    const block = {
      source: 'approach' as const,
      storyScope: 'beat' as const,
      storyBeatKey: 'generated',
    }
    expect(storyBeatPassages(block, record, opener)).toEqual([
      {
        body: second,
        heading: 'One object, everything generated',
        headingLevel: 'h3',
        key: 'generated',
      },
    ])
    expect(
      storyBeatPassages({ ...block, heading: 'Mine', headingLevel: 'h4' }, record, opener),
    ).toEqual([{ body: second, heading: 'Mine', headingLevel: 'h4', key: 'generated' }])
  })

  it('under section scope: the overview, then every beat with its own heading; the override opens the run', () => {
    const block = {
      source: 'approach' as const,
      storyScope: 'section' as const,
      heading: 'The approach',
    }
    expect(
      storyBeatPassages(block, record, opener).map((p) => [p.key, p.heading, p.headingLevel]),
    ).toEqual([
      ['overview', 'The approach', 'h3'],
      ['one-object', undefined, 'h3'],
      ['generated', 'One object, everything generated', 'h3'],
      ['unheaded', undefined, 'h3'],
    ])
  })

  it('custom and overview print the override only', () => {
    const body = copy('Page-only passage')
    expect(storyBeatPassages({ source: 'custom', body, heading: 'Aside' }, record, opener)).toEqual(
      [{ body, heading: 'Aside', headingLevel: 'h3', key: 'custom' }],
    )
    expect(storyBeatPassages({ source: 'approach', storyScope: 'overview' }, record, null)).toEqual(
      [{ body: undefined, heading: undefined, headingLevel: 'h2', key: 'overview' }],
    )
  })
})
