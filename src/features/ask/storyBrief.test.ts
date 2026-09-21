import { describe, expect, it } from 'vitest'
import type { Project } from '@/payload-types'
import { richTextFixture } from '@/shared/testing/richTextFixture'
import {
  type AskStoryBrief,
  namesStory,
  storyBriefFrom,
  storyBriefText,
  storyWords,
  THIN_STORY_WORDS,
  withStoryBrief,
} from './storyBrief'

const PAGE = { path: '/works/gentlebeast', title: 'GentleBeast' }

const term = (id: number, name: string) => ({ id, name }) as never

const project = {
  id: 4,
  publicTitle: 'An on-demand dog training website',
  organization: { id: 3, name: 'Gentle Beast', shortName: 'GB Dogs' },
  capabilities: [term(3, 'Brand Identity'), term(1, 'Web Design')],
  industries: [term(9, 'Consumer Tech')],
  platforms: [term(1, 'Webflow')],
  deliverables: [
    { title: 'UX/UI Design', description: 'Website experience and interface design.' },
    { title: 'Course Catalog', description: null },
  ],
} as unknown as Project

const prose = (count: number) =>
  richTextFixture(Array.from({ length: count }, () => 'word').join(' '))

const brief = (overrides: Partial<AskStoryBrief> = {}): AskStoryBrief => ({
  ...storyBriefFrom(
    PAGE,
    {
      summaries: { oneLine: 'One line.', short: 'A short summary.', medium: null },
      featuredCapabilities: [term(5, 'Product Design'), term(1, 'Web Design')],
    },
    project,
  ),
  ...overrides,
})

describe('storyWords', () => {
  it('counts every section, overview and beats, and nothing else', () => {
    expect(storyWords({})).toBe(0)
    expect(
      storyWords({
        context: { body: prose(40) },
        approach: {
          body: prose(10),
          storyBeats: [{ key: 'a', label: 'A', heading: 'Two words', body: prose(8) }],
        },
      }),
    ).toBe(60)
  })
})

describe('storyBriefFrom', () => {
  it('reads a record with little story as thin, with the kinds of work it can still name', () => {
    const thin = brief()
    expect(thin.thin).toBe(true)
    expect(thin.client).toBe('Gentle Beast')
    // Featured first, the project's others after, each once.
    expect(thin.capabilities).toEqual(['Product Design', 'Web Design', 'Brand Identity'])
    expect(thin.summary).toBe('A short summary.')
  })

  it('reads a written story as not thin', () => {
    const written = storyBriefFrom(
      PAGE,
      { summaries: {}, context: { body: prose(THIN_STORY_WORDS) } },
      project,
    )
    expect(written.thin).toBe(false)
  })

  it('drops a relation the public cannot read, which stays a bare id', () => {
    const unread = storyBriefFrom(PAGE, { summaries: {}, featuredCapabilities: [5] }, null)
    expect(unread.capabilities).toEqual([])
    expect(unread.client).toBeNull()
  })
})

describe('storyBriefText', () => {
  it('lists the kinds of work under the labels the corpus uses', () => {
    const text = storyBriefText(brief())
    expect(text).toContain('Client: Gentle Beast')
    expect(text).toContain('Capabilities: Product Design, Web Design, Brand Identity')
    expect(text).toContain('Platforms: Webflow')
    expect(text).toContain('- UX/UI Design: Website experience and interface design.')
    expect(text).toContain('- Course Catalog')
  })
})

describe('withStoryBrief', () => {
  it('leads the sources and keeps what retrieval found of the same page under it', () => {
    const sources = withStoryBrief(
      [
        { title: 'Expertise', url: '/expertise/websites', text: 'How we build.', similarity: 0.5 },
        { title: 'GentleBeast', url: PAGE.path, text: 'A client said: great.', similarity: 0.4 },
      ],
      brief(),
    )
    expect(sources.map((source) => source.url)).toEqual([PAGE.path, '/expertise/websites'])
    expect(sources[0].text).toContain('Capabilities:')
    expect(sources[0].text).toContain('A client said: great.')
  })

  it('grounds a turn retrieval found nothing for', () => {
    expect(withStoryBrief([], brief())).toHaveLength(1)
  })
})

describe('namesStory', () => {
  it('finds the title, the client and its short name, whatever the spacing or case', () => {
    for (const question of [
      'What did you do for GentleBeast?',
      'tell me about the gentle beast project',
      'Was Gentle-Beast built on Webflow?',
      'What was GB Dogs like to work with?',
    ]) {
      expect(namesStory(question, brief()), question).toBe(true)
    }
  })

  it('leaves a question that names nothing, or another client, to the judge', () => {
    for (const question of [
      'What did you do for them?',
      'Tell me about your work with Arturo.',
      'What is your process like?',
    ]) {
      expect(namesStory(question, brief()), question).toBe(false)
    }
  })

  it('never matches a name short enough to be a word', () => {
    expect(namesStory('Where do we go from here?', brief({ title: 'Go', client: 'Arc' }))).toBe(
      false,
    )
  })
})
