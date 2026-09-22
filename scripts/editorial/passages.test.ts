import { describe, expect, it } from 'vitest'
import { passagesOf } from './passages'

const lexical = (...blocks: { type: string; text: string; tag?: string }[]) => ({
  root: {
    type: 'root',
    format: '',
    direction: 'ltr',
    children: blocks.map(({ type, text, tag }) => ({
      type,
      tag,
      children: [
        { type: 'text', text: text.slice(0, 5), format: 1 },
        { type: 'text', text: text.slice(5), mode: 'normal' },
      ],
    })),
  },
})

describe('passagesOf', () => {
  it('reads a rich text field as one passage per paragraph or heading, bold and all', () => {
    const doc = {
      context: {
        body: lexical(
          { type: 'heading', tag: 'h2', text: 'Where things stood' },
          { type: 'paragraph', text: 'The site was on Webflow and the story was in a deck.' },
        ),
      },
    }
    expect(passagesOf(doc)).toEqual([
      { path: 'context.body', kind: 'heading', text: 'Where things stood' },
      {
        path: 'context.body',
        kind: 'paragraph',
        text: 'The site was on Webflow and the story was in a deck.',
      },
    ])
  })

  it('tells headings, labels and paragraphs apart in plain text fields', () => {
    const doc = {
      title: 'The new CMS',
      storyBeats: [
        {
          key: 'one-record',
          label: 'One record',
          heading: 'One record, many readers',
          body: lexical({ type: 'paragraph', text: 'Every page points back at the same record.' }),
        },
      ],
      summaries: {
        short: 'A content hub that the website, the assistant and agents all read from.',
      },
    }
    expect(passagesOf(doc).map(({ path, kind }) => `${path}:${kind}`)).toEqual([
      'title:heading',
      'storyBeats.0.label:label',
      'storyBeats.0.heading:heading',
      'storyBeats.0.body:paragraph',
      'summaries.short:paragraph',
    ])
  })

  it('skips what is not copy: code, specs, keys, internal notes and populated relationships', () => {
    const doc = {
      slug: 'not-copy',
      internalNotes: 'Source: a draft; a deck; a call.',
      labProject: { id: 3, createdAt: '2026-09-01', title: 'Another document entirely' },
      layout: [
        { blockType: 'code', language: 'ts', code: 'const seamless = true' },
        {
          blockType: 'chart',
          spec: { title: 'Unlock' },
          caption: 'Frame time per streak count, measured on a laptop.',
        },
      ],
    }
    expect(passagesOf(doc)).toEqual([
      {
        path: 'layout.1.caption',
        kind: 'paragraph',
        text: 'Frame time per streak count, measured on a laptop.',
      },
    ])
  })
})
