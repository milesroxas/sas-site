import { describe, expect, it } from 'vitest'
import { faqPageSchema, organizationSchema } from './schema'

const answer = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text, version: 1 }] }],
  },
})

describe('faqPageSchema', () => {
  it('collects questions at the top level and inside a Section', () => {
    const schema = faqPageSchema([
      { blockType: 'richText' },
      {
        blockType: 'faq',
        items: [{ question: 'How long does a site take?', answer: answer('Three to six months.') }],
      } as never,
      {
        blockType: 'section',
        blocks: [
          {
            blockType: 'faq',
            items: [{ question: 'Do you build it?', answer: answer('A partner does.') }],
          } as never,
        ],
      },
    ])

    expect(schema).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How long does a site take?',
          acceptedAnswer: { '@type': 'Answer', text: 'Three to six months.' },
        },
        { '@type': 'Question', name: 'Do you build it?' },
      ],
    })
  })

  it('is null when nothing asks a question', () => {
    expect(faqPageSchema([{ blockType: 'richText' }])).toBeNull()
    expect(faqPageSchema(null)).toBeNull()
  })
})

describe('organizationSchema', () => {
  it('names the agency a ProfessionalService with its profiles as sameAs', () => {
    const schema = organizationSchema({
      name: 'Suits & Sandals',
      socialProfiles: [{ label: 'Clutch', url: 'https://clutch.co/profile/suits-sandals' }],
    })
    expect(schema).toMatchObject({
      '@type': 'ProfessionalService',
      sameAs: ['https://clutch.co/profile/suits-sandals'],
    })
  })
})
