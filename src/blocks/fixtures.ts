/**
 * Fixtures for block stories and the /demo playgrounds. Builders produce the
 * minimal serialized Lexical shapes RichText needs; document fixtures satisfy
 * the generated payload-types so stories type-check against real block props.
 */
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { IndustryWorkPanel } from '@/blocks/IndustryWork/Component.client'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import type {
  CaseStudy,
  LabPage,
  LabProject,
  Media,
  Post,
  Testimonial,
  WorkPage,
} from '@/payload-types'

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

/**
 * A Lexical block node (a component the editor added from the toolbar).
 * `fields` is the block's own document, `blockType` included.
 */
export const blockNode = (fields: Record<string, unknown>): SerializedNode => ({
  type: 'block',
  fields,
  format: '',
  version: 2,
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

/**
 * A single-color SVG mark as the Insight list renders it (a mask over the
 * text color), inlined as a data URL so the story needs no upload and Chromatic
 * no network. `updatedAt` is empty on purpose: `getMediaUrl` appends it as a
 * cache tag, and a query string after `</svg>` would break the data URL.
 */
const svgMarkFixture = (id: number, alt: string, body: string): Media => ({
  id,
  usageStatus: 'public-approved',
  alt,
  url: `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${body}</svg>`,
  )}`,
  filename: `${id}.svg`,
  mimeType: 'image/svg+xml',
  width: 28,
  height: 28,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
})

/** The six marks on the Paper frame ("featureStatementGrid v2 proposal"), in reading order. */
export const insightMarkFixtures = {
  twoCirclesDashed: svgMarkFixture(
    20,
    'Two overlapping circles, one dashed',
    '<circle cx="9" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.25"/><circle cx="19" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.25" stroke-dasharray="2 3"/>',
  ),
  twoCircles: svgMarkFixture(
    21,
    'Two overlapping circles',
    '<circle cx="11" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="1.25"/><circle cx="17" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="1.25"/>',
  ),
  nestedSquares: svgMarkFixture(
    22,
    'A square inside a dashed square',
    '<rect x="3.5" y="3.5" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.25" stroke-dasharray="2 3"/><rect x="3.5" y="3.5" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.25"/>',
  ),
  threeLines: svgMarkFixture(
    23,
    'Three staggered lines',
    '<path d="M3 8H19" stroke="currentColor" stroke-width="1.25"/><path d="M7 14H25" stroke="currentColor" stroke-width="1.25"/><path d="M3 20H15" stroke="currentColor" stroke-width="1.25"/>',
  ),
  halfCircle: svgMarkFixture(
    24,
    'A circle filled below its waterline',
    '<circle cx="14" cy="14" r="10.5" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M3.5 17.5H24.5" stroke="currentColor" stroke-width="1.25"/><path d="M4.1 17.5A10.5 10.5 0 0 0 23.9 17.5Z" fill="currentColor"/>',
  ),
  expandArrow: svgMarkFixture(
    25,
    'An arrow expanding between two corners',
    '<path d="M3.5 11.5V3.5H11.5" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M24.5 16.5V24.5H16.5" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M8 20L20 8" stroke="currentColor" stroke-width="1.25"/><path d="M14 8H20V14" fill="none" stroke="currentColor" stroke-width="1.25"/>',
  ),
} as const satisfies Record<string, Media>

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

/**
 * Canonical decisions on a case study. Blocks narrow them by `featured`, so
 * the set carries both kinds.
 */
export const caseStudyKeyDecisionsFixture: NonNullable<CaseStudy['keyDecisions']> = [
  {
    key: 'organize-around-user-intent',
    title: 'Organize around intent, not org chart',
    decision: 'Navigation follows what a visitor came to do, not how the company is structured.',
    impact: 'Sales stopped fielding "where do I find" emails within a month of launch.',
    featured: true,
  },
  {
    key: 'one-proof-per-claim',
    title: 'One proof per claim',
    decision:
      'Every capability page carries a single piece of evidence rather than a wall of logos.',
    impact: 'Page length halved and time on page went up.',
    featured: true,
  },
  {
    key: 'defer-the-configurator',
    title: 'Defer the configurator',
    decision: 'The pricing configurator moved to phase two so the story could ship first.',
    impact: 'Launch landed six weeks earlier.',
  },
]

/**
 * Structured results. Only `approvedForPublic` metrics ever leave the study,
 * so the unapproved one here exercises the filter in the renderer.
 */
export const caseStudyMetricsFixture: NonNullable<CaseStudy['metrics']> = [
  {
    key: 'qualified-leads',
    label: 'Qualified leads per month',
    value: '+68',
    unit: '%',
    qualifier: 'Six months post-launch, against the prior half-year.',
    approvedForPublic: true,
    featured: true,
  },
  {
    key: 'time-to-first-demo',
    label: 'Time to first demo',
    value: '9',
    unit: ' days',
    approvedForPublic: true,
    featured: true,
  },
  {
    key: 'bounce-rate',
    label: 'Bounce rate',
    value: '-22',
    unit: '%',
    approvedForPublic: true,
  },
  {
    key: 'internal-nps',
    label: 'Internal NPS',
    value: '61',
    approvedForPublic: false,
    featured: true,
  },
]

const workPageFixture = (id: number, title: string, slug: string): WorkPage => ({
  id,
  title,
  slug,
  caseStudy: {
    id,
    title,
    key: slug,
    project: id,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  coverAsset: mediaFixture,
  _status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

/** Related-work grids: published work pages with a populated case study. */
export const workPageFixtures: WorkPage[] = [
  workPageFixture(1, 'Clarity for a payments platform', 'interchecks'),
  workPageFixture(2, 'A calmer story for a care network', 'blindcut'),
  workPageFixture(3, 'Repositioning a freight marketplace', 'northbeam'),
]

const labPageFixture = (id: number, title: string, slug: string): LabPage => ({
  id,
  title,
  slug,
  labProject: {
    id,
    title,
    key: slug,
    kind: 'experiment',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  coverAsset: mediaFixture,
  _status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

/** Related-project grids on lab pages. */
export const labPageFixtures: LabPage[] = [
  labPageFixture(1, 'Type scale playground', 'type-scale-playground'),
  labPageFixture(2, 'Shader-backed page transitions', 'shader-page-transitions'),
  labPageFixture(3, 'A retrieval index for our own writing', 'retrieval-index'),
]

export const labTechnologiesFixture: NonNullable<LabProject['technologies']> = [
  { name: 'Next.js' },
  { name: 'React Three Fiber' },
  { name: 'GLSL' },
  { name: 'GSAP' },
]

/** Internal links are filtered out upstream, so only public ones appear here. */
export const labProjectLinksFixture: NonNullable<LabProject['projectLinks']> = [
  { label: 'Live demo', url: 'https://example.com/demo', visibility: 'public' },
  { label: 'Source', url: 'https://example.com/source', visibility: 'public' },
]
