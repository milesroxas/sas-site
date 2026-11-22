/**
 * The Section cutover (docs/blocks-reorg-roadmap.md, section 0, step 3):
 * move a composition's top-level Section-nestable blocks into `section`
 * blocks without changing how the page reads.
 *
 * Policy:
 * - In scope: a top-level block whose renderer paints its own band
 *   (`SPACING_MAP`) AND that the collection's own Section accepts (read from
 *   the Payload config, so the script never offers a Section a block it would
 *   refuse). Out-of-scope blocks (shells) and existing `section` blocks pass
 *   through untouched, so the script is idempotent.
 * - A run of adjacent in-scope blocks with the same band theme and the same
 *   band spacing becomes one Section with `stack` equal to that spacing. A
 *   stack step is the sum of two adjacent bands of that step
 *   (`SPACING_SCALE` in `src/blocks/shared/section.tsx`), so the run pads
 *   exactly as it did as separate bands.
 * - A Standard heading (`caseStudyTransition`, `richTransition`) opens a
 *   Section with the one block after it, on that block's spacing and the
 *   default stack: the heading had no bottom padding (`pb-0`) and the block's
 *   top padding was the gap, which the default stack restates. Its own top
 *   padding takes the block's band step, the one visible change.
 * - The Section takes the band theme as-is; every nested block's own theme is
 *   reset to `default`, because a block inside a Section renders bare and its
 *   theme is dead data (the admin hides that select there).
 * - `customize` is set only when theme, spacing or stack differ from the
 *   defaults.
 *
 * Safety:
 * - Drizzle push is forced off before the Payload config loads: a content
 *   script never syncs schema, and against production a push would apply
 *   this branch's schema to the live database.
 * - Saves are drafts by default; `--publish` publishes documents whose latest
 *   version is published (a document with unpublished work is always saved
 *   as a draft). The live page changes only when someone publishes.
 * - `--only work-pages/adacore,work-pages/vault-workforce-screening` limits
 *   the run to those documents.
 * - A real run writes a snapshot of every layout it touched to
 *   scripts/snapshots/ first; `--restore <file>` replays it (as drafts unless
 *   `--publish`).
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env scripts/wrap-sections.ts --dry-run [--only …]
 *   pnpm exec tsx --env-file=.env scripts/wrap-sections.ts [--only …] [--publish]
 *   pnpm exec tsx --env-file=.env scripts/wrap-sections.ts --restore scripts/snapshots/<file>.json
 *
 * Against production, point --env-file at the pulled production env and take
 * a DB backup first.
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Block, Field, SanitizedConfig } from 'payload'
import type { SectionBlockSpacing } from '@/blocks/section/shared'
import type { BandTheme } from '@/blocks/shared/band-theme'

process.env.PAYLOAD_DB_PUSH = 'false'

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const { SECTION_CHILDREN_FIELD } = await import('@/blocks/section/shared')
const { BAND_THEME_OPTIONS } = await import('@/blocks/shared/band-theme')
const { RESTORE_LAYOUT_CONTEXT } = await import('@/blocks/shared/top-level-blocks')

const COLLECTIONS = [
  'pages',
  'posts',
  'work-pages',
  'lab-pages',
  'expertise-pages',
  'audience-pages',
] as const

type CollectionSlug = (typeof COLLECTIONS)[number]

type LayoutBlock = { blockType?: string; id?: string | null; [key: string]: unknown }

const SECTION_SLUG = 'section'
const DEFAULT_THEME: BandTheme = 'default'
const BAND_THEMES = new Set<string>(BAND_THEME_OPTIONS.map((option) => option.value))
const HEADINGS = new Set(['caseStudyTransition', 'richTransition'])

/**
 * Theme values stored before the band-theme rename (blocks: light / dark;
 * Section: inherit / secondary / accent), for snapshots taken before
 * `20261001_183459_band_theme_roles`. Neutral and brand kept their names.
 */
const LEGACY_THEME: Record<string, BandTheme> = {
  light: 'default',
  dark: 'inverted',
  inherit: 'default',
  secondary: 'neutral',
  accent: 'brand',
}

const normalizeTheme = (value: unknown): BandTheme | null => {
  if (typeof value !== 'string') return null
  if (BAND_THEMES.has(value)) return value as BandTheme
  return LEGACY_THEME[value] ?? null
}

/** Section spacing restating each renderer's hardcoded band spacing. */
const SPACING_MAP: Record<string, SectionBlockSpacing> = {
  fullMedia: 'loose',
  mediaContentSplit: 'loose',
  splitContentNarrow: 'loose',
  imagePair: 'loose',
  splitImageOffset: 'loose',
  mediaBlock: 'loose',
  carousel: 'loose',
  caseStudyTransition: 'default',
  richTransition: 'default',
  featureHeadingOffset: 'default',
  // featureImageStatement is conditional; see sectionSpacingFor().
}

/**
 * The Work renderer paints Statement on its own loose reveal band
 * (`FeatureImageStatementSection` in RenderCaseStudyBlocks), whatever the
 * image width; every other surface uses the component's own band.
 */
const WORK_SPACING_MAP: Record<string, SectionBlockSpacing> = {
  featureImageStatement: 'loose',
}

const sectionSpacingFor = (
  block: LayoutBlock,
  collection: CollectionSlug,
): SectionBlockSpacing | undefined => {
  if (!block.blockType) return undefined
  if (collection === 'work-pages' && WORK_SPACING_MAP[block.blockType]) {
    return WORK_SPACING_MAP[block.blockType]
  }
  if (block.blockType === 'featureImageStatement') {
    return block.imageWidth === 'full' ? 'loose' : 'default'
  }
  return SPACING_MAP[block.blockType]
}

const findField = (fields: Field[], name: string): Field | undefined => {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field
    if ('fields' in field && !('name' in field)) {
      const nested = findField(field.fields, name)
      if (nested) return nested
    }
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const nested = findField(tab.fields, name)
        if (nested) return nested
      }
    }
  }
  return undefined
}

const blocksOf = (field: Field | undefined): Block[] =>
  field?.type === 'blocks'
    ? field.blocks.filter((block): block is Block => typeof block !== 'string')
    : []

/** The block slugs a collection's Section accepts, read from the sanitized config. */
const nestableSlugs = (sanitized: SanitizedConfig, collection: CollectionSlug): Set<string> => {
  const fields = sanitized.collections.find((entry) => entry.slug === collection)?.fields ?? []
  const section = blocksOf(findField(fields, 'layout')).find((block) => block.slug === SECTION_SLUG)
  const children = blocksOf(section && findField(section.fields, SECTION_CHILDREN_FIELD))
  return new Set(children.map((block) => block.slug))
}

/** A nested block renders bare: only the Section's theme applies. */
const resetNestedTheme = (block: LayoutBlock): LayoutBlock =>
  'theme' in block && block.theme !== DEFAULT_THEME ? { ...block, theme: DEFAULT_THEME } : block

const sectionOf = (
  blocks: LayoutBlock[],
  theme: BandTheme,
  spacing: SectionBlockSpacing,
  stack: SectionBlockSpacing,
): LayoutBlock => ({
  blockType: SECTION_SLUG,
  customize: theme !== DEFAULT_THEME || spacing !== 'default' || stack !== 'default',
  theme,
  spacing,
  stack,
  [SECTION_CHILDREN_FIELD]: blocks.map(resetNestedTheme),
})

/** Legacy names normalized at every depth (restores of old snapshots). */
const normalizeLayout = (layout: LayoutBlock[]): LayoutBlock[] =>
  layout.map((block) => {
    const next: LayoutBlock = { ...block }
    if ('theme' in next) next.theme = normalizeTheme(next.theme)
    const children = next[SECTION_CHILDREN_FIELD]
    if (next.blockType === SECTION_SLUG && Array.isArray(children)) {
      next[SECTION_CHILDREN_FIELD] = normalizeLayout(children as LayoutBlock[])
    }
    return next
  })

const transformLayout = (
  layout: LayoutBlock[],
  nestable: Set<string>,
  collection: CollectionSlug,
): LayoutBlock[] => {
  const spacingOf = (block: LayoutBlock) => sectionSpacingFor(block, collection)
  const inScope = (block: LayoutBlock | undefined) =>
    Boolean(
      block?.blockType &&
        block.blockType !== SECTION_SLUG &&
        nestable.has(block.blockType) &&
        spacingOf(block),
    )
  const themeOf = (block: LayoutBlock) => normalizeTheme(block.theme) ?? DEFAULT_THEME

  const next: LayoutBlock[] = []
  let index = 0
  while (index < layout.length) {
    const block = layout[index]
    const spacing = inScope(block) ? spacingOf(block) : undefined
    if (!spacing) {
      next.push(block)
      index += 1
      continue
    }
    const theme = themeOf(block)
    const following = layout[index + 1]
    const followingSpacing =
      following && inScope(following) && !HEADINGS.has(following.blockType ?? '')
        ? spacingOf(following)
        : undefined
    // A Standard heading opens a Section with the block it introduces.
    if (HEADINGS.has(block.blockType ?? '') && followingSpacing && themeOf(following) === theme) {
      next.push(sectionOf([block, following], theme, followingSpacing, 'default'))
      index += 2
      continue
    }
    // A run of same-theme, same-spacing blocks shares one Section.
    const run = [block]
    let cursor = index + 1
    while (
      cursor < layout.length &&
      inScope(layout[cursor]) &&
      !HEADINGS.has(layout[cursor].blockType ?? '') &&
      themeOf(layout[cursor]) === theme &&
      spacingOf(layout[cursor]) === spacing
    ) {
      run.push(layout[cursor])
      cursor += 1
    }
    next.push(sectionOf(run, theme, spacing, spacing))
    index = cursor
  }
  return next
}

const themeTag = (block: LayoutBlock) =>
  block.theme && block.theme !== DEFAULT_THEME ? `(${String(block.theme)})` : ''

const describe = (layout: LayoutBlock[]) =>
  layout
    .map((block) =>
      block.blockType === SECTION_SLUG
        ? `section${themeTag(block)}{${String(block.spacing)}/${String(block.stack)}}[${(
            (block[SECTION_CHILDREN_FIELD] as LayoutBlock[]) ?? []
          )
            .map((child) => child.blockType)
            .join(', ')}]`
        : `${block.blockType}${themeTag(block)}`,
    )
    .join(' · ')

const argValue = (flag: string) => {
  const index = process.argv.indexOf(flag)
  if (index === -1) return null
  const value = process.argv[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${flag} needs a value`)
  return value
}

const run = async () => {
  const dryRun = process.argv.includes('--dry-run')
  const publish = process.argv.includes('--publish')
  const restoreFile = argValue('--restore')
  const only = argValue('--only')
  const onlySet = only ? new Set(only.split(',').map((entry) => entry.trim())) : null

  const payload = await getPayload({ config })
  const context = { disableRevalidate: true }

  if (restoreFile) {
    const snapshot: {
      collection: CollectionSlug
      id: number
      layout: LayoutBlock[]
    }[] = JSON.parse(fs.readFileSync(restoreFile, 'utf8'))
    for (const entry of snapshot) {
      await payload.update({
        collection: entry.collection,
        id: entry.id,
        data: {
          layout: normalizeLayout(entry.layout) as never,
          ...(publish ? { _status: 'published' as const } : {}),
        },
        draft: !publish,
        depth: 0,
        // A snapshot holds the layout as it was, top-level blocks included.
        context: { ...context, [RESTORE_LAYOUT_CONTEXT]: true },
      })
      payload.logger.info(`restored ${entry.collection}/${entry.id}${publish ? '' : ' (draft)'}`)
    }
    payload.logger.info(`Restored ${snapshot.length} documents from ${restoreFile}`)
    return
  }

  const planned: {
    collection: CollectionSlug
    id: number | string
    slug?: unknown
    asDraft: boolean
    layout: LayoutBlock[]
    next: LayoutBlock[]
  }[] = []

  for (const collection of COLLECTIONS) {
    const nestable = nestableSlugs(payload.config, collection)
    const { docs } = await payload.find({
      collection,
      draft: true,
      depth: 0,
      limit: 500,
      pagination: false,
    })

    for (const doc of docs as Array<{
      id: number | string
      slug?: unknown
      layout?: LayoutBlock[] | null
      _status?: 'draft' | 'published' | null
    }>) {
      if (onlySet && !onlySet.has(`${collection}/${String(doc.slug ?? doc.id)}`)) continue
      const layout = doc.layout ?? []
      const next = transformLayout(normalizeLayout(layout), nestable, collection)
      if (JSON.stringify(next) === JSON.stringify(normalizeLayout(layout))) {
        payload.logger.info(`unchanged ${collection}/${String(doc.slug ?? doc.id)}`)
        continue
      }
      // Unpublished work is never published by the run.
      const asDraft = !publish || doc._status === 'draft'
      planned.push({ collection, id: doc.id, slug: doc.slug, asDraft, layout, next })
      payload.logger.info(
        `${dryRun ? '[dry-run] ' : ''}${collection}/${String(doc.slug ?? doc.id)}${asDraft ? ' (as draft)' : ' (publish)'}\n  before: ${describe(layout)}\n  after:  ${describe(next)}`,
      )
    }
  }

  if (dryRun) {
    payload.logger.info(
      `Dry run complete: ${planned.length} documents would change; nothing written.`,
    )
    return
  }
  if (!planned.length) {
    payload.logger.info('Nothing to change.')
    return
  }

  // Snapshot before the first write, so a failure mid-run is still restorable.
  const dir = path.resolve('scripts/snapshots')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(
    dir,
    `wrap-sections-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  )
  fs.writeFileSync(
    file,
    JSON.stringify(
      planned.map(({ collection, id, slug, layout }) => ({ collection, id, slug, layout })),
      null,
      2,
    ),
  )
  payload.logger.info(`Snapshot: ${file}`)

  for (const entry of planned) {
    await payload.update({
      collection: entry.collection,
      id: entry.id,
      data: {
        layout: entry.next as never,
        ...(entry.asDraft ? {} : { _status: 'published' as const }),
      },
      draft: entry.asDraft,
      depth: 0,
      context,
    })
  }
  payload.logger.info(
    `Updated ${planned.length} documents. Revalidation was skipped (disableRevalidate); publish from the admin, or revalidate, to serve the new layouts.`,
  )
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
