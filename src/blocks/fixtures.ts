/**
 * Fixtures for block stories and the /demo playgrounds. Builders produce the
 * minimal serialized Lexical shapes RichText needs; document fixtures satisfy
 * the generated payload-types so stories type-check against real block props.
 */
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { IndustryWorkPanel } from '@/blocks/IndustryWork/Component.client'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import type { Media, Post, Testimonial } from '@/payload-types'

type SerializedNode = Record<string, unknown>

export const TEXT_FORMAT_BOLD = 1

export const text = (content: string, format = 0): SerializedNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: content,
  version: 1,
})

export const paragraph = (...children: SerializedNode[]): SerializedNode => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

export const heading = (
  tag: 'h1' | 'h2' | 'h3' | 'h4',
  ...children: SerializedNode[]
): SerializedNode => ({
  type: 'heading',
  tag,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

export const richText = (...children: SerializedNode[]): DefaultTypedEditorState =>
  ({
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as DefaultTypedEditorState

/**
 * Absolute URL to a production media asset. Storybook resolves it either way;
 * the design-sync previews render as standalone pages with no site root, so a
 * root-relative path would 404 there.
 */
export const mediaFixture: Media = {
  id: 1,
  usageStatus: 'public-approved',
  alt: 'Gradient animation background',
  url: 'https://media.suits-sandals.com/Gradient%20Animation_converted-poster-1-1200x630.jpg',
  filename: 'Gradient Animation_converted-poster-1-1200x630.jpg',
  mimeType: 'image/jpeg',
  width: 1200,
  height: 630,
  caption: richText(
    paragraph(text('A caption for the media block, rendered from Lexical rich text.')),
  ),
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

/**
 * Absolute URL to a production media asset. `Media` routes to `VideoMedia`
 * when `mimeType` includes `video`, matching production uploads.
 */
export const videoFixture: Media = {
  id: 2,
  usageStatus: 'public-approved',
  alt: 'Gradient animation background video',
  url: 'https://media.suits-sandals.com/Gradient%20Animation_converted-1.mp4',
  filename: 'Gradient Animation_converted-1.mp4',
  mimeType: 'video/mp4',
  width: 1920,
  height: 1080,
  caption: richText(paragraph(text('A caption for a video media document.'))),
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

/** Hero image backgrounds — same placeholder still as `mediaFixture`, no caption. */
export const heroImageFixture: Media = {
  ...mediaFixture,
  id: 3,
  caption: null,
}

const workEntryFixture = (
  id: number,
  title: string,
  client: string,
  media: Media = mediaFixture,
): WorkEntry => {
  const slug = title.toLowerCase().replace(/\s+/g, '-')
  return {
    id,
    slug,
    href: `/works/${slug}`,
    title,
    client,
    industry: null,
    capabilities: ['Brand strategy', 'Web design'],
    media,
  }
}

/** Shared by the IndustryWork story and the /demo/immersive playground. */
export const industryWorkPanelsFixture: IndustryWorkPanel[] = [
  {
    id: 'fintech',
    industry: 'fintech',
    subheading: 'we help platforms explain themselves',
    secondLine: 'so buyers stop needing a sales call.',
    work: workEntryFixture(1, 'Clarity for a payments platform', 'Interchecks'),
  },
  {
    id: 'healthcare',
    industry: 'healthcare',
    subheading: 'we make complex care legible',
    secondLine: null,
    work: workEntryFixture(2, 'A calmer story for a care network', 'Blindcut', videoFixture),
  },
  {
    id: 'logistics',
    industry: 'logistics',
    subheading: 'we turn operations into narrative',
    secondLine: 'from the warehouse to the boardroom.',
    work: workEntryFixture(3, 'Repositioning a freight marketplace', 'Northbeam'),
  },
]

const postFixture = (id: number, title: string, slug: string): Post => ({
  id,
  title,
  slug,
  content: richText(paragraph(text('Post body.'))),
  standfirst:
    'Internal misalignment shows up everywhere your brand touches the world. A shared language system fixes the story before it fractures.',
  meta: {
    title,
    description:
      'A short description of the post, shown on the card in archive and related-post grids.',
    image: mediaFixture,
  },
  categories: [
    {
      id: 1,
      title: 'Engineering',
      slug: 'engineering',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  publishedAt: '2026-01-01T00:00:00.000Z',
  _status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

export const postFixtures: Post[] = [
  postFixture(1, 'Designing resilient content models', 'designing-resilient-content-models'),
  postFixture(2, 'Shipping faster with block-based pages', 'shipping-faster-with-blocks'),
]

const testimonialFixture = (
  id: number,
  quote: string,
  speakerOrganization: string,
): Testimonial => ({
  id,
  internalTitle: `${speakerOrganization} quote`,
  organization: 1,
  speakerName: 'Jordan Avery',
  speakerOrganization,
  quote: richText(paragraph(text(quote))),
  approvalStatus: 'approved-public',
  _status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

export const testimonialFixtures: Testimonial[] = [
  testimonialFixture(
    1,
    'The result is a clearer story, a stronger system, and something people can understand and use.',
    'Interchecks',
  ),
  testimonialFixture(
    2,
    '“From the beginning, they’ve been proactive, intelligent, and interested in our product’s success.”',
    'Blindcut',
  ),
  testimonialFixture(
    3,
    'They took a sprawling set of ideas and shaped it into a brand we can actually grow with.',
    'Northbeam',
  ),
  testimonialFixture(
    4,
    'Every conversation moved the work forward. The site finally says what we do — plainly and well.',
    'Fieldnote Labs',
  ),
]
