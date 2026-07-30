/**
 * Storybook-only fixtures for block stories. Builders produce the minimal
 * serialized Lexical shapes RichText needs; document fixtures satisfy the
 * generated payload-types so stories type-check against real block props.
 */
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { Media, Post } from '@/payload-types'

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

const postFixture = (id: number, title: string, slug: string): Post => ({
  id,
  title,
  slug,
  content: richText(paragraph(text('Post body.'))),
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
