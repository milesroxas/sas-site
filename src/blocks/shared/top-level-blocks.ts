import { type BlocksField, type BlocksFieldValidation, validations } from 'payload'

import { sectionNestableBlocks } from './section-blocks'

type BlocksFilterOptions = NonNullable<BlocksField['filterOptions']>

/** Every composition surface: each `layout` blocks field on the site. */
export type CompositionSurface = 'home' | 'lab' | 'pages' | 'posts' | 'segment' | 'work'

/**
 * Shell blocks: the blocks a surface keeps at the top level for good, beside
 * its Sections, because they own a pinned or full-viewport shell or close the
 * page (docs/blocks-reorg-roadmap.md, D4). This is the one statement of which
 * blocks those are. Everything else a surface offers is either in the
 * Section-nestable run (added inside a Section) or legacy (hidden from the
 * drawer, still rendered where a page already holds it).
 */
export const SHELL_BLOCKS: Record<CompositionSurface, readonly string[]> = {
  home: ['industryWork', 'testimonialsMarquee', 'audienceTabs'],
  lab: ['labFacts', 'labRelatedProjects'],
  pages: ['cta', 'archive', 'content'],
  posts: [],
  segment: ['cta', 'archive', 'content'],
  work: ['caseStudyMediaShowcase', 'featuredWork', 'caseStudyStorySection'],
}

/**
 * Surfaces with no Section block yet. Their top level is the only level, so
 * the run is offered there directly.
 */
const SECTIONLESS_SURFACES = new Set<CompositionSurface>(['home'])

const runSlugs = sectionNestableBlocks.map((block) => block.slug)

/** The block slugs a surface offers at its top level. */
export const topLevelBlockSlugs = (surface: CompositionSurface): string[] => [
  ...(SECTIONLESS_SURFACES.has(surface) ? runSlugs : ['section']),
  ...SHELL_BLOCKS[surface],
]

const blockTypesIn = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap((row) =>
        row && typeof row === 'object' && typeof row.blockType === 'string' ? [row.blockType] : [],
      )
    : []

/**
 * The top-level rule for a surface's `layout` field, spread into the field:
 * `filterOptions` limits the drawer, `validate` enforces the same rule on
 * every published save (admin, REST, Local API and the MCP tools alike).
 *
 * Allowed at the top level: Section plus the surface's shells (on a
 * Section-less surface, the run plus its shells), and every block type the
 * saved document already holds. That last part keeps a page built before the
 * Section model saveable with its blocks intact; the cost is that its drawer
 * still offers those types until its content moves into Sections.
 *
 * Draft saves skip validation in Payload, so a draft can hold a new legacy
 * block until it is published, when the save is refused.
 *
 * Hiding a block here never drops it from the config: the Postgres adapter
 * reads block rows through the field config, so removing a block that still
 * has rows would hide them from every read.
 */
export const topLevelBlocks = (
  surface: CompositionSurface,
): { filterOptions: BlocksFilterOptions; validate: BlocksFieldValidation } => ({
  // The drawer: what the form holds now stays offered, so the filter never
  // flags a row the editor is looking at. Payload's own save check runs this
  // against the incoming value, so it allows everything; `validate` below is
  // the one that refuses.
  filterOptions: ({ siblingData }) => {
    const present = blockTypesIn((siblingData as { layout?: unknown } | undefined)?.layout)
    return [...new Set([...topLevelBlockSlugs(surface), ...present])]
  },
  validate: async (value, options) => {
    const base = await validations.blocks(value, options)
    // Only the server's save passes the saved value (`previousValue`); the
    // admin's per-change form state does not carry the saved rows, so it is
    // not checked here.
    if (base !== true || options.event !== 'submit') return base
    const allowed = new Set([
      ...topLevelBlockSlugs(surface),
      ...blockTypesIn(options.previousValue),
    ])
    const added = [...new Set(blockTypesIn(value))].filter((slug) => !allowed.has(slug))
    if (!added.length) return true
    const labelOf = (slug: string) => {
      const label = options.blocks.find((block) => block.slug === slug)?.labels?.singular
      return typeof label === 'string' ? label : slug
    }
    const section = options.blocks.find((block) => block.slug === 'section')
    const nested = section?.fields.find((field) => 'name' in field && field.name === 'blocks')
    const nestable = new Set(
      nested?.type === 'blocks' ? nested.blocks.map((block) => block.slug) : [],
    )
    const inSection = added.filter((slug) => nestable.has(slug)).map(labelOf)
    const retired = added.filter((slug) => !nestable.has(slug)).map(labelOf)
    return [
      inSection.length && `Add ${inSection.join(', ')} inside a Section.`,
      retired.length && `${retired.join(', ')} is no longer offered here.`,
    ]
      .filter(Boolean)
      .join(' ')
  },
})
