/**
 * Seed the CMS with placeholder content so every block and template can be
 * reviewed in the browser: taxonomy, clients → projects → case studies → six
 * work pages (all case-study blocks), posts (embedded banner/code/media
 * blocks), a block-review page carrying every page-layout block, hero-variant
 * pages, lab + expertise + who-we-help pages, and the Home global.
 *
 * Existing media documents are reused — nothing is uploaded. Media that does
 * not belong to a real asset library is claimed into a placeholder library so
 * work pages pass publish validation.
 *
 * Usage (local Docker DB only, unless --allow-remote):
 *   pnpm seed          # upsert placeholder content in place
 *   pnpm seed:drop     # wipe content collections first, then seed
 *
 * Runs are idempotent: docs are matched by slug/key/internal title.
 */
import { type CollectionSlug, getPayload, type Payload, type Where } from 'payload'
import {
  paragraph,
  richText,
  TEXT_FORMAT_BOLD,
  text,
  heading as textHeading,
} from '../../src/blocks/fixtures'
import config from '../../src/payload.config'
import type { Media } from '../../src/payload-types'

const DROP = process.argv.includes('--drop')
const ALLOW_REMOTE = process.argv.includes('--allow-remote')

const dbUrl = process.env.POSTGRES_URL ?? ''
if (!/127\.0\.0\.1|localhost/.test(dbUrl) && !ALLOW_REMOTE) {
  console.error(
    `POSTGRES_URL does not look local (${dbUrl.replace(/:[^@/]+@/, ':***@') || 'unset'}).\n` +
      'Seeding rewrites content wholesale — refusing to run against a remote database.\n' +
      'Pass --allow-remote if you really mean it.',
  )
  process.exit(1)
}

/** Shared context: skips Next revalidation hooks, which throw outside a request. */
const ctx = { disableRevalidate: true }

/** Pseudo ObjectId for Lexical block nodes and array rows that want stable ids. */
let oidCounter = 0
const oid = () => `5eedb10c${(++oidCounter).toString(16).padStart(16, '0')}`

/** Lexical block node embedded inside rich text (posts support banner/code/media). */
const blockNode = (fields: Record<string, unknown>) => ({
  type: 'block',
  fields: { id: oid(), ...fields },
  format: '',
  version: 2,
})

const bold = (content: string) => text(content, TEXT_FORMAT_BOLD)

/** Placeholder story paragraphs, lightly varied per client so pages read distinctly. */
const story = (client: string, topic: string) =>
  richText(
    paragraph(
      text(
        `${client} came to us with ${topic}. The substance was strong; the way it was expressed made it harder to see.`,
      ),
    ),
    paragraph(
      text(
        'We worked through the story, the structure, and the system together, keeping what was true and rebuilding how it was presented.',
      ),
    ),
  )

const para = (copy: string) => richText(paragraph(text(copy)))

const log = (msg: string) => console.log(`  • ${msg}`)

// ---------------------------------------------------------------------------
// Generic upsert
// ---------------------------------------------------------------------------

let payload: Payload

async function upsert(
  collection: CollectionSlug,
  where: Where,
  data: Record<string, unknown>,
): Promise<number> {
  const existing = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    draft: true,
    pagination: false,
  })
  const found = existing.docs[0]
  if (found) {
    const updated = await payload.update({
      collection,
      id: found.id,
      data,
      depth: 0,
      draft: false,
      context: ctx,
    })
    return updated.id as number
  }
  const created = await payload.create({
    collection,
    data: data as never,
    depth: 0,
    draft: false,
    context: ctx,
  })
  return created.id as number
}

// ---------------------------------------------------------------------------
// Drop
// ---------------------------------------------------------------------------

/**
 * Content collections wiped by --drop, children before the records they
 * reference (work pages hold a delete-guard on case studies). Users, media,
 * newsletters, subscribers, and redirects are never touched.
 */
const DROP_ORDER: CollectionSlug[] = [
  'work-pages',
  'lab-pages',
  'expertise-pages',
  'audience-pages',
  'pages',
  'posts',
  'testimonials',
  'case-studies',
  'lab-projects',
  'asset-libraries',
  'projects',
  'organizations',
  'categories',
  'audiences',
  'form-submissions',
  'forms',
]

async function dropContent() {
  console.log('Dropping content collections…')
  for (const collection of DROP_ORDER) {
    const result = await payload.delete({
      collection,
      where: { id: { exists: true } },
      depth: 0,
      context: ctx,
    })
    log(`${collection}: deleted ${result.docs.length}`)
  }
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

type MediaPool = { images: Media[]; videos: Media[] }

/**
 * Claim library-less (or orphaned-library) public-approved media into the
 * placeholder asset library. Media already owned by a real library is left
 * alone so republishing genuine work pages keeps validating.
 */
async function claimMedia(placeholderLibId: number): Promise<MediaPool> {
  const libs = await payload.find({ collection: 'asset-libraries', limit: 100, depth: 0 })
  const realLibIds = new Set(libs.docs.map((d) => d.id))
  const media = await payload.find({
    collection: 'media',
    limit: 200,
    depth: 0,
    sort: 'id',
    pagination: false,
  })
  const claimable = media.docs.filter((m) => {
    if (m.usageStatus !== 'public-approved') return false
    const lib =
      typeof m.assetLibrary === 'object' && m.assetLibrary ? m.assetLibrary.id : m.assetLibrary
    return lib == null || lib === placeholderLibId || !realLibIds.has(lib)
  })
  for (const m of claimable) {
    const lib =
      typeof m.assetLibrary === 'object' && m.assetLibrary ? m.assetLibrary.id : m.assetLibrary
    if (lib !== placeholderLibId) {
      await payload.update({
        collection: 'media',
        id: m.id,
        data: { assetLibrary: placeholderLibId },
        depth: 0,
        context: ctx,
      })
    }
  }
  const images = claimable.filter((m) => m.mimeType?.startsWith('image/'))
  const videos = claimable.filter((m) => m.mimeType?.startsWith('video/'))
  if (!images.length) {
    throw new Error(
      'No claimable public-approved images found. Seed reuses existing media documents — upload a few images (Media collection) first, or pull production content into the local DB.',
    )
  }
  log(`claimed ${images.length} images, ${videos.length} videos into the placeholder library`)
  return { images, videos }
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const WORK_ITEMS = [
  {
    client: 'Meridian Analytics',
    sector: 'Software',
    title: 'Turning a dense data platform into a clear product story',
    slug: 'meridian-analytics-platform-story',
    thesis: 'The platform was powerful. The story asked visitors to assemble it themselves.',
    oneLine: 'We reframed Meridian’s data platform around the decisions it enables.',
    challenge:
      'a platform whose capabilities were real but scattered across features, integrations, and audiences',
  },
  {
    client: 'Fieldnote Robotics',
    sector: 'Robotics',
    title: 'Making autonomous field robotics legible to buyers',
    slug: 'fieldnote-robotics-launch',
    thesis: 'Deep engineering credibility needed a front door non-engineers could open.',
    oneLine: 'We built Fieldnote a brand and site that translates autonomy into outcomes.',
    challenge: 'a technically brilliant product whose marketing read like an internal spec',
  },
  {
    client: 'Harbor & Pine',
    sector: 'Hospitality',
    title: 'A hospitality group finds one voice across nine properties',
    slug: 'harbor-and-pine-brand-system',
    thesis: 'Nine properties, nine stories — and no shared thread between them.',
    oneLine: 'We unified Harbor & Pine’s properties under one flexible brand system.',
    challenge: 'a portfolio of distinct properties with no shared identity or content structure',
  },
  {
    client: 'Lumen Health Collective',
    sector: 'Healthcare',
    title: 'Clarity for a care model that defies categories',
    slug: 'lumen-health-care-model',
    thesis: 'A new care model needed language patients and partners could trust.',
    oneLine: 'We gave Lumen’s hybrid care model a name, a story, and a digital home.',
    challenge:
      'a care model that sat between existing categories and confused both patients and partners',
  },
  {
    client: 'Atlas Freight Systems',
    sector: 'Logistics',
    title: 'Modernizing the brand of a freight network in motion',
    slug: 'atlas-freight-modernization',
    thesis: 'Fifty years of reliability deserved better than a dated identity.',
    oneLine: 'We modernized Atlas Freight’s identity without discarding its history.',
    challenge:
      'a trusted but dated brand competing against slick venture-backed logistics startups',
  },
  {
    client: 'Verdant Energy Co',
    sector: 'Energy',
    title: 'Positioning community solar for skeptical audiences',
    slug: 'verdant-energy-community-solar',
    thesis: 'Community solar is a good deal that sounds too good — trust was the product.',
    oneLine: 'We repositioned Verdant’s community solar offer around transparency.',
    challenge: 'an offer audiences assumed was a catch, in a category full of noise',
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  payload = await getPayload({ config })

  // Captured before any drop so the Home dynamic-audience content survives.
  const previousHome = await payload.findGlobal({ slug: 'home', depth: 0, draft: true })
  const previousDynamicAudience = (previousHome.layout ?? []).find(
    (b) => b.blockType === 'dynamicAudience',
  )

  if (DROP) await dropContent()

  console.log('Seeding taxonomy…')
  const categoryIds: number[] = []
  for (const title of ['Strategy', 'Branding', 'Digital Experience']) {
    const slug = title.toLowerCase().replace(/\s+/g, '-')
    categoryIds.push(
      await upsert('categories', { slug: { equals: slug } }, { title, slug, generateSlug: false }),
    )
  }
  const capabilityIds: number[] = []
  for (const name of ['Brand Strategy', 'Brand Communications', 'Content Systems', 'Website']) {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    capabilityIds.push(
      await upsert('capabilities', { slug: { equals: slug } }, { name, slug, generateSlug: false }),
    )
  }
  const industryIds = new Map<string, number>()
  for (const item of WORK_ITEMS) {
    const slug = item.sector.toLowerCase().replace(/\s+/g, '-')
    industryIds.set(
      item.sector,
      await upsert(
        'industries',
        { slug: { equals: slug } },
        { name: item.sector, slug, generateSlug: false },
      ),
    )
  }
  log(
    `categories ${categoryIds.length}, capabilities ${capabilityIds.length}, industries ${industryIds.size}`,
  )

  console.log('Seeding clients, projects, case studies…')
  const orgIds: number[] = []
  const projectIds: number[] = []
  for (const item of WORK_ITEMS) {
    const orgSlug = item.client.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const orgId = await upsert(
      'organizations',
      { slug: { equals: orgSlug } },
      {
        name: item.client,
        slug: orgSlug,
        generateSlug: false,
        industries: [industryIds.get(item.sector)],
        description: para(`${item.client} is a placeholder client seeded for design review.`),
        _status: 'published',
      },
    )
    orgIds.push(orgId)
    projectIds.push(
      await upsert(
        'projects',
        { internalTitle: { equals: `${item.client} — engagement` } },
        {
          internalTitle: `${item.client} — engagement`,
          publicTitle: item.title,
          organization: orgId,
          status: 'completed',
          engagementType: 'project',
          capabilities: capabilityIds,
          industries: [industryIds.get(item.sector)],
          publicSummary: para(item.oneLine),
          _status: 'published',
        },
      ),
    )
  }

  // One shared placeholder library keeps every seeded work page's media valid.
  const placeholderLibId = await upsert(
    'asset-libraries',
    { slug: { equals: 'placeholder-assets' } },
    {
      name: 'Placeholder Assets',
      slug: 'placeholder-assets',
      generateSlug: false,
      organization: orgIds[0],
      project: projectIds[0],
      libraryStatus: 'active',
      description: 'Shared pool of placeholder media used by seeded content.',
    },
  )
  const pool = await claimMedia(placeholderLibId)
  const img = (i: number) => pool.images[i % pool.images.length].id
  const vid = (i: number) => (pool.videos.length ? pool.videos[i % pool.videos.length].id : img(i))

  console.log('Seeding testimonials…')
  const speakers = [
    ['Dana Whitfield', 'VP of Marketing'],
    ['Samir Okafor', 'Chief Executive Officer'],
    ['Elena Marsh', 'Head of Product'],
  ]
  const testimonialIds: number[] = []
  for (const [i, [name, role]] of speakers.entries()) {
    testimonialIds.push(
      await upsert(
        'testimonials',
        { internalTitle: { equals: `Seed — ${name}` } },
        {
          internalTitle: `Seed — ${name}`,
          organization: orgIds[i % orgIds.length],
          project: projectIds[i % projectIds.length],
          speakerName: name,
          speakerRole: role,
          quote: richText(
            paragraph(
              text('They made the complicated parts of our business '),
              bold('feel obvious'),
              text(' — to our team as much as to our customers.'),
            ),
          ),
          approvalStatus: 'approved-public',
          _status: 'published',
        },
      ),
    )
  }
  log(`${testimonialIds.length} testimonials`)

  console.log('Seeding case studies…')
  const caseStudyIds: number[] = []
  for (const [i, item] of WORK_ITEMS.entries()) {
    caseStudyIds.push(
      await upsert(
        'case-studies',
        { key: { equals: item.slug } },
        {
          title: item.title,
          key: item.slug,
          generateKey: false,
          project: projectIds[i],
          thesis: item.thesis,
          summaries: {
            oneLine: item.oneLine,
            short: `${item.oneLine} A placeholder case study seeded for reviewing work-page blocks.`,
            medium: `${item.oneLine} ${item.client} had ${item.challenge}. We clarified the story, rebuilt the structure, and delivered a system the team can keep using.`,
          },
          primaryAudience: 'prospective-client',
          featuredCapabilities: [capabilityIds[i % capabilityIds.length]],
          context: story(item.client, item.challenge),
          challenge: story(item.client, item.challenge),
          strategy: para(
            'We organized the experience around the problems the audience is actually trying to solve, and let the structure carry the story.',
          ),
          approach: para(
            'Messaging, information architecture, identity, and digital experience moved together, each decision reinforcing the others.',
          ),
          learnings: para(
            'Clarity compounds: every layer that got simpler made the next layer easier to design, write, and maintain.',
          ),
          outcomeSummary: para(
            'A clearer story, a stronger system, and a site the internal team ships with confidently.',
          ),
          objectives: [
            {
              title: 'Clarify the story',
              description: 'One narrative both experts and newcomers can follow.',
            },
            {
              title: 'Strengthen the system',
              description: 'Identity and content structures that scale.',
            },
          ],
          keyDecisions: [
            {
              key: 'narrative',
              title: 'Lead with the problem, not the product',
              problem: 'Visitors could not tell what changed for them.',
              decision: 'Reorganize the story around audience outcomes.',
              rationale: 'Outcomes give every feature a reason to exist.',
              impact: 'The platform became legible to non-specialists.',
              featured: true,
            },
            {
              key: 'system',
              title: 'Design the system before the pages',
              problem: 'Every page was a one-off, so nothing compounded.',
              decision: 'Build a small set of expressive, reusable patterns.',
              rationale: 'A system keeps quality high after handoff.',
              impact: 'New pages ship in days instead of weeks.',
              featured: true,
            },
          ],
          metrics: [
            {
              key: 'engagement',
              label: 'Time on key pages',
              value: '+64',
              unit: '%',
              direction: 'increase',
              qualifier: 'Placeholder metric for design review',
              approvedForPublic: true,
              featured: true,
            },
            {
              key: 'velocity',
              label: 'Page production time',
              value: '-40',
              unit: '%',
              direction: 'decrease',
              qualifier: 'Placeholder metric for design review',
              approvedForPublic: true,
            },
          ],
          testimonials: [testimonialIds[i % testimonialIds.length]],
          assetLibraries: [placeholderLibId],
          _status: 'published',
        },
      ),
    )
  }
  log(`${caseStudyIds.length} case studies`)

  console.log('Seeding work pages…')
  // Layouts distribute all fifteen case-study blocks across the six pages.
  const workLayouts: Record<string, unknown>[][] = [
    [
      {
        blockType: 'splitContentNarrow',
        source: 'challenge',
        eyebrow: 'The Challenge',
        heading: 'Where the friction lived',
        media: img(0),
        imagePosition: 'right',
        theme: 'light',
      },
      {
        blockType: 'featureImageStatement',
        source: 'approach',
        media: img(1),
        textPosition: 'right',
        imageWidth: 'full',
      },
      {
        blockType: 'caseStudyStorySection',
        source: 'strategy',
        media: img(2),
        layout: 'text-right',
        theme: 'light',
        width: 'wide',
      },
      {
        blockType: 'caseStudyMetrics',
        heading: 'Results',
        source: 'featured-public',
        layout: 'grid',
        theme: 'dark',
      },
      {
        blockType: 'caseStudyTestimonial',
        testimonial: testimonialIds[0],
        layout: 'editorial',
        theme: 'light',
      },
      {
        blockType: 'caseStudyRelatedWork',
        heading: 'Related work',
        selectionMode: 'automatic-capability-match',
        limit: 3,
        layout: 'grid',
      },
    ],
    [
      {
        blockType: 'caseStudyStorySection',
        source: 'context',
        media: img(3),
        layout: 'sticky-media',
        theme: 'light',
        width: 'standard',
      },
      {
        blockType: 'imagePair',
        source: 'custom',
        heading: 'The system in use',
        body: para('Two crops from the same system, holding together at very different scales.'),
        portraitMedia: img(4),
        landscapeMedia: img(5),
        portraitPosition: 'left',
        textPosition: 'under-portrait',
        theme: 'light',
      },
      {
        blockType: 'caseStudyKeyDecisions',
        heading: 'Key decisions',
        source: 'featured',
        layout: 'cards',
        theme: 'neutral',
      },
      {
        blockType: 'caseStudyTransition',
        eyebrow: 'Next',
        heading: 'From story to system',
        body: para('With the narrative settled, the work moved into structure.'),
        layout: 'centered',
        theme: 'dark',
      },
      {
        blockType: 'featureTabs',
        tabs: [
          {
            title: 'Strategy',
            heading: 'Position before polish',
            source: 'custom',
            description: para(
              'We settled what the brand needs to say before touching how it looks.',
            ),
            items: [{ text: 'Messaging framework' }, { text: 'Audience definition' }],
            media: img(6),
            caption: 'Workshop artifacts',
          },
          {
            title: 'Design',
            heading: 'A system, not pages',
            source: 'custom',
            description: para('Reusable patterns keep quality high long after handoff.'),
            items: [{ text: 'Design system' }, { text: 'Component library' }],
            media: img(7),
            caption: 'System specimens',
          },
        ],
      },
    ],
    [
      {
        blockType: 'splitImageOffset',
        source: 'custom',
        heading: 'Details carry the identity',
        body: para('Small moments — captions, rules, spacing — do most of the brand’s work.'),
        largeMedia: img(0),
        smallMedia: img(1),
        captionPosition: 'right',
        theme: 'light',
      },
      {
        blockType: 'caseStudyMediaShowcase',
        heading: 'Selected screens',
        introduction: para('A sample of the shipped experience.'),
        media: [img(2), img(3), img(4)],
        layout: 'grid',
        theme: 'light',
        showCaptions: true,
      },
      {
        blockType: 'featureHeadingOffset',
        eyebrow: 'Outcome',
        heading: 'What changed',
        source: 'outcome-summary',
      },
    ],
    [
      {
        blockType: 'featureStatementGrid',
        eyebrow: 'Approach',
        heading: 'How the work held together',
        source: 'custom',
        statement: para(
          'Strategy, identity, content, and digital experience moved as one engagement.',
        ),
        footnote: 'Placeholder cards for design review.',
        cards: [
          {
            media: img(5),
            title: 'Strategy',
            description: 'Positioning and messaging that survive contact with real audiences.',
          },
          {
            media: img(6),
            title: 'Identity',
            description: 'A visual system with range, not a logo with rules.',
          },
          {
            media: img(7),
            title: 'Experience',
            description: 'A site the internal team can actually run.',
          },
        ],
      },
      {
        blockType: 'caseStudyStorySection',
        source: 'outcome-summary',
        layout: 'text-only',
        theme: 'light',
        width: 'narrow',
      },
      {
        blockType: 'caseStudyMetrics',
        heading: 'By the numbers',
        source: 'all-public',
        layout: 'row',
        theme: 'light',
      },
    ],
    [
      {
        blockType: 'featureStatementLinks',
        statement: richText(
          paragraph(
            text('The result is a '),
            bold('clearer story'),
            text(' and a system people can use.'),
          ),
        ),
        links: [
          { link: { type: 'custom', url: '/works', label: 'All work' } },
          { link: { type: 'custom', url: '/expertise', label: 'Our expertise' } },
        ],
        theme: 'light',
      },
      {
        blockType: 'splitContentNarrow',
        source: 'custom',
        eyebrow: 'Process',
        heading: 'Working in the open',
        body: para('Weekly working sessions kept decisions moving and surprises rare.'),
        media: img(8),
        imagePosition: 'left',
        theme: 'neutral',
      },
      {
        blockType: 'caseStudyMediaShowcase',
        media: [img(0), img(1), img(2), img(3)],
        layout: 'horizontal',
        theme: 'dark',
      },
    ],
    [
      {
        blockType: 'caseStudyStorySection',
        source: 'learnings',
        eyebrow: 'Learnings',
        layout: 'centered',
        theme: 'light',
        width: 'standard',
      },
      {
        blockType: 'caseStudyTestimonial',
        testimonial: testimonialIds[1 % testimonialIds.length],
        layout: 'centered',
        theme: 'neutral',
        showPortrait: false,
      },
      {
        blockType: 'caseStudyTransition',
        heading: 'Where it goes next',
        body: para('The system keeps growing — the placeholder review ends here.'),
        layout: 'statement',
        theme: 'dark',
      },
    ],
  ]
  const heroLayouts = ['landscape', 'centered-media'] as const
  const heroTreatments = ['full-bleed', 'contained', 'background', 'floating'] as const
  const workPageIds: number[] = []
  for (const [i, item] of WORK_ITEMS.entries()) {
    workPageIds.push(
      await upsert(
        'work-pages',
        { slug: { equals: item.slug } },
        {
          title: item.title,
          slug: item.slug,
          generateSlug: false,
          caseStudy: caseStudyIds[i],
          featured: i < 2,
          hero: {
            eyebrow: `${item.client} case study`,
            media: img(i),
            layout: heroLayouts[i % heroLayouts.length],
            theme: i % 2 === 0 ? 'dark' : 'light',
            mediaTreatment: heroTreatments[i % heroTreatments.length],
          },
          intro: {
            eyebrow: 'Introduction',
            title: item.thesis,
          },
          coverAsset: img(i + 3),
          layout: workLayouts[i],
          _status: 'published',
        },
      ),
    )
  }
  // Featured work lists the other work pages, so it can only be appended once
  // every work page exists.
  const [firstWorkPageId, ...otherWorkPageIds] = workPageIds
  await payload.update({
    collection: 'work-pages',
    id: firstWorkPageId,
    data: {
      layout: [
        ...workLayouts[0],
        {
          blockType: 'featuredWork',
          eyebrow: 'Featured Work',
          entries: otherWorkPageIds,
          theme: 'dark',
        },
      ],
    },
    depth: 0,
    draft: false,
    context: ctx,
  })
  log(`${workPageIds.length} work pages (featured work on ${WORK_ITEMS[0].slug})`)

  console.log('Seeding posts…')
  const users = await payload.find({ collection: 'users', limit: 1, depth: 0 })
  const authorIds = users.docs.length ? [users.docs[0].id] : []
  const postSpecs = [
    {
      title: 'Why clarity beats cleverness in B2B messaging',
      slug: 'clarity-beats-cleverness',
      heroStyle: 'immersive',
    },
    {
      title: 'A field guide to content systems',
      slug: 'field-guide-content-systems',
      heroStyle: 'banner',
    },
    {
      title: 'Designing for audiences who read past the fold',
      slug: 'designing-past-the-fold',
      heroStyle: 'immersive',
    },
    {
      title: 'What a brand system is actually for',
      slug: 'what-a-brand-system-is-for',
      heroStyle: 'banner',
    },
  ] as const
  const postIds: number[] = []
  for (const [i, spec] of postSpecs.entries()) {
    postIds.push(
      await upsert(
        'posts',
        { slug: { equals: spec.slug } },
        {
          title: spec.title,
          slug: spec.slug,
          generateSlug: false,
          heroStyle: spec.heroStyle,
          heroImage: img(i),
          categories: [categoryIds[i % categoryIds.length]],
          authors: authorIds,
          content: richText(
            paragraph(
              text(
                'This is a placeholder post seeded for template review. It exercises the post hero, body typography, and the ',
              ),
              bold('embedded editor blocks'),
              text(' available inside post content.'),
            ),
            textHeading('h2', text('A section heading')),
            paragraph(
              text(
                'Body copy at reading width. The paragraphs are short on purpose — the point is to see rhythm, measure, and spacing, not to read.',
              ),
            ),
            blockNode({
              blockType: 'banner',
              style: (['info', 'success', 'warning', 'error'] as const)[i % 4],
              content: richText(paragraph(text('A banner block embedded in post content.'))),
            }),
            textHeading('h3', text('Code sample')),
            blockNode({
              blockType: 'code',
              language: 'typescript',
              code: `export const seeded = true\n// Placeholder code block for the ${spec.slug} post`,
            }),
            blockNode({ blockType: 'mediaBlock', media: img(i + 2), size: 'inset' }),
            paragraph(text('Closing paragraph after the embedded blocks.')),
          ),
          meta: {
            title: spec.title,
            description: 'Placeholder insight seeded for reviewing the post template.',
            image: img(i),
          },
          _status: 'published',
        },
      ),
    )
  }
  // Second pass: relatedPosts filterOptions exclude the doc's own id, which
  // does not exist during create — link posts only once they all exist.
  for (const [i, id] of postIds.entries()) {
    await payload.update({
      collection: 'posts',
      id,
      data: { relatedPosts: postIds.filter((other) => other !== id).slice(i % 2, (i % 2) + 2) },
      depth: 0,
      draft: false,
      context: ctx,
    })
  }
  log(`${postIds.length} posts`)

  console.log('Seeding forms and newsletter audience…')
  const formId = await upsert(
    'forms',
    { title: { equals: 'Contact' } },
    {
      title: 'Contact',
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
        {
          blockType: 'textarea',
          name: 'message',
          label: 'What are you working on?',
          required: true,
        },
      ],
      submitButtonLabel: 'Send',
      confirmationType: 'message',
      confirmationMessage: para('Thanks — we will be in touch shortly.'),
    },
  )
  const newsletterAudienceId = await upsert(
    'audiences',
    { slug: { equals: 'general-updates' } },
    {
      name: 'General updates',
      slug: 'general-updates',
      generateSlug: false,
      allowPublicSignup: true,
      description: 'Placeholder public newsletter segment seeded for the signup block.',
    },
  )

  console.log('Seeding pages…')
  const heroLinks = [
    {
      link: {
        type: 'custom' as const,
        url: '/works',
        label: 'See the work',
        appearance: 'default' as const,
      },
    },
    {
      link: {
        type: 'custom' as const,
        url: '/contact',
        label: 'Start a project',
        appearance: 'outline' as const,
      },
    },
  ]
  await upsert(
    'pages',
    { slug: { equals: 'contact' } },
    {
      title: 'Contact',
      slug: 'contact',
      generateSlug: false,
      hero: {
        type: 'lowImpact',
        richText: richText(
          textHeading('h1', text('Contact')),
          paragraph(text('Tell us what you are trying to make sense of.')),
        ),
      },
      layout: [
        {
          blockType: 'formBlock',
          form: formId,
          enableIntro: true,
          introContent: para('A short intro above the form block.'),
        },
      ],
      _status: 'published',
    },
  )
  await upsert(
    'pages',
    { slug: { equals: 'hero-high-impact' } },
    {
      title: 'Hero — high impact',
      slug: 'hero-high-impact',
      generateSlug: false,
      hero: {
        type: 'highImpact',
        title: 'A full-bleed opening statement',
        description: 'High-impact hero with background media and paired links.',
        links: heroLinks,
        media: vid(0),
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: para('Minimal body so the hero stays the subject of review.'),
            },
          ],
        },
      ],
      _status: 'published',
    },
  )
  await upsert(
    'pages',
    { slug: { equals: 'hero-low-impact' } },
    {
      title: 'Hero — low impact',
      slug: 'hero-low-impact',
      generateSlug: false,
      hero: {
        type: 'lowImpact',
        richText: richText(
          textHeading('h1', text('A quiet opening')),
          paragraph(text('Low-impact hero rendered from rich text.')),
        ),
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: para('Minimal body so the hero stays the subject of review.'),
            },
          ],
        },
      ],
      _status: 'published',
    },
  )

  // Dynamic-audience content: reuse whatever is currently on Home, else defaults.
  const defaultAudiences = [
    {
      title: 'leaders',
      subheading: 'align the story, the work, and what comes next.',
      intro:
        'Turn a complex business into a clear direction people can understand, support, and move forward together.',
      media: vid(0),
      items: [
        { text: 'Clarify the company story and strategic position' },
        { text: 'Align leadership around a shared direction' },
        { text: 'Give teams language they can use consistently' },
        { text: 'Connect brand decisions to business priorities' },
        { text: 'Create a clearer path for what comes next' },
      ],
    },
    {
      title: 'marketing teams',
      subheading: 'turn strategy into clear, consistent expression.',
      intro:
        'Give marketing a stronger story, a more useful system, and clearer tools for putting the brand to work.',
      media: vid(1),
      items: [
        { text: 'Turn complex ideas into messages people understand' },
        { text: 'Build a brand system that works across channels' },
        { text: 'Organize content around what audiences need' },
        { text: 'Create a website that makes the value visible' },
        { text: 'Give internal teams tools they can keep using' },
      ],
    },
    {
      title: 'product teams',
      subheading: 'make complex products easier to understand.',
      intro:
        'Connect what the product does with what customers, buyers, and partners actually need to understand.',
      media: vid(2),
      items: [
        { text: 'Translate technical depth into clear customer value' },
        { text: 'Align the product story with the product experience' },
        { text: 'Make complex features easier to understand' },
        { text: 'Build a visual system around the product' },
        { text: 'Create digital experiences that support clarity and trust' },
      ],
    },
    {
      title: 'experts',
      subheading: 'turn deep knowledge into something others can use.',
      intro: 'Preserve the depth of the thinking while giving people a clearer way into it.',
      media: vid(3),
      items: [
        { text: 'Structure complex ideas around audience needs' },
        { text: 'Translate internal language into clearer market language' },
        { text: 'Create visual frameworks that explain difficult subjects' },
        { text: 'Build content systems for ongoing communication' },
        { text: 'Turn expertise into a credible brand and digital presence' },
      ],
    },
  ]
  const mediaIds = new Set([...pool.images, ...pool.videos].map((m) => m.id))
  const existingAudiences =
    previousDynamicAudience && 'audiences' in previousDynamicAudience
      ? previousDynamicAudience.audiences.map((a, i) => ({
          title: a.title,
          subheading: a.subheading,
          intro: a.intro,
          items: (a.items ?? []).map((item) => ({ text: item.text })),
          media: typeof a.media === 'number' && mediaIds.has(a.media) ? a.media : vid(i),
        }))
      : null
  const dynamicAudienceBlock = {
    blockType: 'dynamicAudience' as const,
    heading:
      previousDynamicAudience && 'heading' in previousDynamicAudience
        ? previousDynamicAudience.heading
        : 'How we help',
    audiences: existingAudiences ?? defaultAudiences,
    theme: 'light' as const,
  }

  const audienceTabsBlock = {
    blockType: 'audienceTabs' as const,
    heading:
      'Different roles see different parts of the problem. We help bring the whole picture into focus.',
    tabs: [
      {
        title: 'Leaders',
        intro: "We help leadership define the company's purpose, significance, and direction.",
        items: [
          { text: 'Clarify the company story and strategic position' },
          { text: 'Build alignment around a shared direction' },
          { text: 'Give teams language for explaining the business' },
          { text: 'Connect brand decisions to business priorities' },
          { text: 'Create a stronger foundation for what comes next' },
        ],
        media: img(0),
      },
      {
        title: 'Teams',
        intro:
          'We give marketing and product teams everything they need to stay on-message across every channel and touchpoint.',
        items: [
          { text: 'Turn complex ideas into messages people understand' },
          { text: 'Build a brand system that works across channels' },
          { text: 'Organize content around what audiences need' },
          { text: 'Create a website that makes the value visible' },
          { text: 'Give internal teams tools they can keep using' },
        ],
        media: img(1),
      },
      {
        title: 'Experts',
        intro:
          'We simplify dense material into something people can follow while preserving its value.',
        items: [
          { text: 'Structure complex ideas around audience needs' },
          { text: 'Translate specialist language into clear, credible messaging' },
          { text: 'Create visual frameworks that explain difficult subjects' },
          { text: 'Build content systems for sharing knowledge over time' },
          { text: 'Turn expertise into a distinctive brand and digital presence' },
        ],
        media: img(2),
      },
    ],
    theme: 'dark' as const,
  }

  await upsert(
    'pages',
    { slug: { equals: 'block-review' } },
    {
      title: 'Block review',
      slug: 'block-review',
      generateSlug: false,
      hero: {
        type: 'mediumImpact',
        eyebrow: 'Design review',
        title: 'Every page block, one page',
        description: 'Seeded page carrying every layout block for side-by-side review.',
        links: heroLinks,
        media: img(0),
      },
      layout: [
        {
          blockType: 'cta',
          richText: richText(
            textHeading('h3', text('A call to action block')),
            paragraph(text('Short persuasive copy with paired links.')),
          ),
          links: heroLinks,
        },
        {
          blockType: 'content',
          columns: [
            {
              size: 'oneThird',
              richText: richText(
                textHeading('h3', text('One third')),
                paragraph(text('Column copy at a third of the grid.')),
              ),
            },
            {
              size: 'oneThird',
              richText: richText(
                textHeading('h3', text('One third')),
                paragraph(text('Columns wrap responsively on smaller screens.')),
              ),
            },
            {
              size: 'oneThird',
              richText: richText(
                textHeading('h3', text('With link')),
                paragraph(text('This column also renders a link.')),
              ),
              enableLink: true,
              link: { type: 'custom', url: '/works', label: 'See the work', appearance: 'default' },
            },
          ],
        },
        {
          blockType: 'mediaBlock',
          media: img(1),
          size: 'inset',
          captionOverride: para('A media block with an inline caption override.'),
        },
        {
          blockType: 'archive',
          introContent: richText(
            textHeading('h3', text('From the archive')),
            paragraph(text('Latest posts pulled by collection.')),
          ),
          populateBy: 'collection',
          relationTo: 'posts',
          limit: 4,
          cardVariant: 'contained',
        },
        {
          blockType: 'formBlock',
          form: formId,
          enableIntro: true,
          introContent: para('The shared contact form rendered as a block.'),
        },
        {
          blockType: 'newsletterSignup',
          eyebrow: 'Newsletter',
          heading: 'Occasional, useful, short',
          body: 'Placeholder newsletter signup wired to the seeded public audience.',
          buttonLabel: 'Subscribe',
          audience: newsletterAudienceId,
        },
        {
          blockType: 'featureStatementGrid',
          eyebrow: 'Capabilities',
          heading: 'What we bring into alignment',
          source: 'custom',
          statement: richText(
            paragraph(
              text('Strategy, identity, content, and digital experience — '),
              bold('one system'),
              text(', not four projects.'),
            ),
          ),
          footnote: 'Placeholder cards seeded for review.',
          cards: [
            {
              media: img(2),
              title: 'Strategy',
              description: 'Positioning, messaging, and narrative.',
            },
            { media: img(3), title: 'Identity', description: 'Visual systems with real range.' },
            { media: img(4), title: 'Digital', description: 'Sites and products people can use.' },
          ],
        },
        {
          blockType: 'featureStatementLinks',
          statement: richText(
            paragraph(
              text('Our work brings '),
              bold('strategy, identity, content, and digital experience'),
              text(' into alignment.'),
            ),
          ),
          links: [
            { link: { type: 'custom', url: '/expertise', label: 'Our Expertise' } },
            { link: { type: 'custom', url: '/who-we-help', label: 'Who We Work With' } },
          ],
          theme: 'light',
        },
        {
          blockType: 'featureHeadingOffset',
          eyebrow: 'Method',
          heading: 'Heading with offset supporting copy',
          source: 'custom',
          body: para('The body sits in the offset right column, letting the heading breathe.'),
        },
        {
          blockType: 'featureTabs',
          tabs: [
            {
              title: 'Discovery',
              heading: 'Understand before advising',
              source: 'custom',
              description: para('Research, interviews, and audits before any recommendations.'),
              items: [{ text: 'Stakeholder interviews' }, { text: 'Content audit' }],
              media: img(5),
              caption: 'Discovery artifacts',
            },
            {
              title: 'Definition',
              heading: 'Decide what matters',
              source: 'custom',
              description: para('Positioning and priorities, written down and agreed.'),
              items: [{ text: 'Messaging framework' }, { text: 'Experience map' }],
              media: img(6),
              caption: 'Definition artifacts',
            },
            {
              title: 'Delivery',
              heading: 'Ship the system',
              source: 'custom',
              description: para('Design, build, and handoff with the team in the room.'),
              items: [{ text: 'Design system' }, { text: 'CMS build' }],
              media: img(7),
              caption: 'Delivery artifacts',
            },
          ],
        },
        {
          blockType: 'featureImageStatement',
          media: img(8),
          source: 'custom',
          caption: richText(
            paragraph(
              text('An image statement: '),
              bold('the work should explain itself'),
              text(' — this block gives it room to.'),
            ),
          ),
          textPosition: 'right',
          textSize: 'default',
          imageWidth: 'contained',
        },
        {
          blockType: 'splitContentNarrow',
          source: 'custom',
          eyebrow: 'Split content',
          heading: 'Narrow text beside media',
          body: para('The narrow measure keeps the copy readable beside the image.'),
          media: img(0),
          imagePosition: 'right',
          theme: 'neutral',
        },
        {
          blockType: 'testimonialsMarquee',
          richText: richText(
            paragraph(text('What clients say when the work '), bold('makes sense'), text('.')),
          ),
          links: [
            {
              link: { type: 'custom', url: '/works', label: 'See the work', appearance: 'default' },
            },
          ],
          testimonials: testimonialIds,
        },
        dynamicAudienceBlock,
      ],
      _status: 'published',
    },
  )
  log('pages: contact, hero-high-impact, hero-low-impact, block-review')

  console.log('Seeding lab…')
  const labSpecs = [
    {
      title: 'Immersive gradient studies',
      key: 'immersive-gradient-studies',
      kind: 'experiment' as const,
      page: 'gradient-studies',
      heroLayout: 'immersive' as const,
    },
    {
      title: 'Scroll reveal system',
      key: 'scroll-reveal-system',
      kind: 'tool' as const,
      page: 'scroll-reveal-system',
      heroLayout: 'editorial-split' as const,
    },
  ]
  const labPageIds: number[] = []
  for (const [i, spec] of labSpecs.entries()) {
    const labProjectId = await upsert(
      'lab-projects',
      { key: { equals: spec.key } },
      {
        title: spec.title,
        key: spec.key,
        generateKey: false,
        kind: spec.kind,
        status: 'active',
        thesis: 'Internal experiments keep the client work sharp.',
        summaries: {
          oneLine: `${spec.title} — a placeholder lab project seeded for template review.`,
          short: `${spec.title}: internal work seeded so the lab template has something real to render.`,
        },
        capabilities: [capabilityIds[i % capabilityIds.length]],
        technologies: [{ name: 'TypeScript' }, { name: 'GSAP' }, { name: 'React Three Fiber' }],
        context: para('We wanted a place to push techniques further than client timelines allow.'),
        approach: para('Small weekly iterations, each one shippable, each one documented.'),
        outcome: para('A reusable toolkit that has already fed back into production work.'),
        learnings: para('Constraints from real projects make experiments sharper, not smaller.'),
        coverAsset: img(i),
        selectedAssets: [img(i), img(i + 1), vid(i)],
        projectLinks: [{ label: 'Demo', url: 'https://example.com', visibility: 'public' }],
        _status: 'published',
      },
    )
    labPageIds.push(
      await upsert(
        'lab-pages',
        { slug: { equals: spec.page } },
        {
          title: spec.title,
          slug: spec.page,
          generateSlug: false,
          labProject: labProjectId,
          featured: i === 0,
          hero: {
            eyebrow: 'Lab',
            media: img(i),
            layout: spec.heroLayout,
            theme: 'dark',
            mediaTreatment: 'background',
          },
          coverAsset: img(i + 2),
          layout: [
            {
              blockType: 'labStorySection',
              source: 'context',
              eyebrow: 'Context',
              layout: 'text-left',
              media: img(i + 3),
              theme: 'light',
              width: 'standard',
            },
            {
              blockType: 'labMediaShowcase',
              heading: 'Output',
              introduction: para('Selected frames from the experiment.'),
              media: [img(i), img(i + 1), img(i + 2)],
              layout: 'grid',
              theme: 'light',
              showCaptions: true,
            },
            {
              blockType: 'labFacts',
              heading: 'Facts',
              showStatus: true,
              showTechnologies: true,
              showLinks: true,
              theme: 'neutral',
            },
            {
              blockType: 'splitContentNarrow',
              source: 'custom',
              eyebrow: 'Process',
              heading: 'Iterating in public',
              body: para('Each iteration shipped to the demo route for the team to poke at.'),
              media: img(i + 4),
              imagePosition: 'left',
              theme: 'light',
            },
            {
              blockType: 'labTransition',
              eyebrow: 'Next',
              heading: 'Where this goes',
              body: para('The system moves into production work next quarter.'),
              layout: 'statement',
              theme: 'dark',
            },
            {
              blockType: 'labRelatedProjects',
              heading: 'More from the lab',
              selectionMode: 'automatic-capability-match',
              limit: 2,
              layout: 'grid',
            },
          ],
          _status: 'published',
        },
      ),
    )
  }
  log(`${labPageIds.length} lab pages`)

  console.log('Seeding expertise and who-we-help pages…')
  const expertiseSpecs = [
    { title: 'Brand Strategy', slug: 'brand-strategy', capability: capabilityIds[0] },
    { title: 'Digital Experience', slug: 'digital-experience', capability: capabilityIds[3] },
  ]
  for (const [i, spec] of expertiseSpecs.entries()) {
    await upsert(
      'expertise-pages',
      { slug: { equals: spec.slug } },
      {
        title: spec.title,
        slug: spec.slug,
        generateSlug: false,
        capabilities: [spec.capability],
        hero: {
          type: 'mediumImpact',
          eyebrow: 'Expertise',
          title: spec.title,
          description: 'Placeholder expertise page seeded for template review.',
          links: heroLinks,
          media: img(i),
        },
        layout: [
          {
            blockType: 'featureHeadingOffset',
            eyebrow: 'What it is',
            heading: `${spec.title}, in practice`,
            source: 'custom',
            body: para('How this capability shows up inside an engagement.'),
          },
          {
            blockType: 'splitContentNarrow',
            source: 'custom',
            eyebrow: 'How we work',
            heading: 'From ambiguity to a system',
            body: para('A placeholder walkthrough of the engagement arc.'),
            media: img(i + 1),
            imagePosition: 'right',
            theme: 'light',
          },
          {
            blockType: 'cta',
            richText: richText(
              textHeading('h3', text('Ready when you are')),
              paragraph(text('Bring us the thing that is hard to explain.')),
            ),
            links: heroLinks,
          },
        ],
        _status: 'published',
      },
    )
  }
  const audiencePageSpecs = [
    {
      title: 'Complex B2B platforms',
      slug: 'complex-b2b-platforms',
      sectors: ['Software', 'Robotics'],
    },
    {
      title: 'Mission-driven organizations',
      slug: 'mission-driven-organizations',
      sectors: ['Healthcare', 'Energy'],
    },
  ]
  for (const [i, spec] of audiencePageSpecs.entries()) {
    await upsert(
      'audience-pages',
      { slug: { equals: spec.slug } },
      {
        title: spec.title,
        slug: spec.slug,
        generateSlug: false,
        industries: spec.sectors.map((s) => industryIds.get(s)),
        hero: {
          type: 'mediumImpact',
          eyebrow: 'Who we help',
          title: spec.title,
          description: 'Placeholder segment page seeded for template review.',
          links: heroLinks,
          media: img(i + 2),
        },
        layout: [
          {
            blockType: 'featureStatementGrid',
            eyebrow: 'Where we help',
            heading: 'The problems we keep solving',
            source: 'custom',
            statement: para('Placeholder statement about this audience segment.'),
            cards: [
              { media: img(i), title: 'Clarity', description: 'A story people can follow.' },
              {
                media: img(i + 1),
                title: 'Structure',
                description: 'An architecture that scales.',
              },
              { media: img(i + 2), title: 'Momentum', description: 'A system the team can run.' },
            ],
          },
          {
            blockType: 'splitContentNarrow',
            source: 'custom',
            eyebrow: 'Approach',
            heading: 'Meeting the segment where it is',
            body: para('Placeholder copy describing how the engagement adapts to this audience.'),
            media: img(i + 3),
            imagePosition: 'left',
            theme: 'neutral',
          },
          {
            blockType: 'cta',
            richText: richText(
              textHeading('h3', text('Sound familiar?')),
              paragraph(text('Tell us what your audience is not getting.')),
            ),
            links: heroLinks,
          },
        ],
        _status: 'published',
      },
    )
  }
  log('2 expertise pages, 2 who-we-help pages')

  console.log('Seeding Home global…')
  const previousHeroMedia =
    typeof previousHome.hero?.media === 'number' && mediaIds.has(previousHome.hero.media)
      ? previousHome.hero.media
      : vid(0)
  await payload.updateGlobal({
    slug: 'home',
    depth: 0,
    context: ctx,
    data: {
      title: 'Home',
      hero: {
        type: 'center',
        title: 'Make it make sense',
        description:
          'We bring clarity, character, and creative momentum to businesses with complex offerings, niche audiences, and more to say than their current brand can express.',
        media: previousHeroMedia,
        featuredPost: postIds[0],
        featuredLabel: 'Insights',
      },
      statement: {
        body: richText(
          paragraph(
            text('Our work brings '),
            bold('strategy'),
            text(', identity, content, and digital experience into alignment.'),
          ),
        ),
      },
      layout: [
        {
          blockType: 'featureStatementLinks',
          statement: richText(
            paragraph(
              text(
                'Our work brings strategy, identity, content, and digital experience into alignment. The result is a clearer story, a stronger system, and something people can understand and use.',
              ),
            ),
          ),
          links: [
            { link: { type: 'custom', url: '/expertise', label: 'Our Expertise' } },
            { link: { type: 'custom', url: '/who-we-help', label: 'Who We Work With' } },
          ],
          theme: 'light',
        },
        audienceTabsBlock,
      ],
      _status: 'published',
    },
  })
  log('home hero, statement, featureStatementLinks, audienceTabs')

  console.log('\nSeed complete.')
  console.log('Review routes: / · /block-review · /hero-high-impact · /hero-low-impact · /contact')
  console.log(
    '  /works + 6 work pages · /insights + 4 posts · /lab ×2 · /expertise ×2 · /who-we-help ×2',
  )
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
