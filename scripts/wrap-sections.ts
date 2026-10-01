/**
 * Phase C of docs/blocks-reorg-roadmap.md, the production cutover: wrap the
 * Section-nestable blocks of every composition into `section` blocks, 1:1,
 * preserving each block's band and rhythm on the Section it now lives in.
 *
 * Policy (kept deliberately mechanical; see the roadmap for why):
 * - Each in-scope top-level block becomes one Section holding exactly that
 *   block. In scope means: the renderer paints its own band (`SPACING_MAP`)
 *   AND the collection's own Section accepts the block (read from the Payload
 *   config, so the script can never offer a Section a block it would refuse).
 *   Out-of-scope blocks and existing `section` blocks pass through, so the
 *   script is idempotent.
 * - The Section takes the block's band theme as-is: blocks and Sections share
 *   one vocabulary (`@/blocks/shared/band-theme`: default, inverted, neutral,
 *   brand), so nothing is translated. The nested block's own theme is reset
 *   to `default`, because a block inside a Section renders bare and its theme
 *   is dead data (the admin hides that select there).
 * - Blocks already inside a Section get the same reset, so every nested block
 *   ends the run on `default` and only the Section carries the band.
 * - Section spacing restates what the block's renderer hardcoded, so the
 *   band pads the same before and after.
 * - `customize` is set only when theme or spacing differ from the defaults.
 *
 * Order at cutover: CI deploys the code and runs the migrations first
 * (`20260930_band_theme_roles` renames the stored theme values in place:
 * light → default, dark → inverted, and the Section's inherit / secondary /
 * accent → default / neutral / brand), then this script runs against the
 * migrated database. Values are normalized from the legacy names too
 * (`LEGACY_THEME`), so a dry run before the migration, and a `--restore` of a
 * snapshot taken before it, both still produce valid documents.
 *
 * Known parity caveat: a transition block's band had no bottom padding
 * (`pb-0`), which a Section cannot restate, so a wrapped transition gains the
 * default bottom padding. Review them in the dry run and, if wanted, merge
 * each into the following Section by hand afterwards (that is also the better
 * editorial structure).
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/wrap-sections.ts --dry-run
 *   npx tsx --env-file=.env scripts/wrap-sections.ts
 *   npx tsx --env-file=.env scripts/wrap-sections.ts --restore scripts/snapshots/<file>.json
 *
 * Against production, point --env-file at the pulled production env instead,
 * and take a DB backup first. A real run writes a snapshot of every layout it
 * saw to scripts/snapshots/, which --restore replays (legacy theme names
 * normalized).
 */
import fs from 'node:fs'
import path from 'node:path'
import config from '@payload-config'
import { type Block, type Field, getPayload, type SanitizedConfig } from 'payload'
import { SECTION_CHILDREN_FIELD, type SectionBlockSpacing } from '@/blocks/section/shared'
import { BAND_THEME_OPTIONS, type BandTheme } from '@/blocks/shared/band-theme'

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

/**
 * Theme values stored before the band-theme rename (blocks: light / dark;
 * Section: inherit / secondary / accent). The migration rewrites them in the
 * database; this covers the paths that bypass it (snapshots, a pre-migration
 * dry run). Neutral and brand kept their names.
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

/**
 * Section spacing restating each renderer's hardcoded band spacing
 * (`loose` media bands, `normal` → `default` copy bands).
 */
const SPACING_MAP: Record<string, SectionBlockSpacing> = {
  fullMedia: 'loose',
  mediaContentSplit: 'loose',
  splitContentNarrow: 'loose',
  imagePair: 'loose',
  splitImageOffset: 'loose',
  mediaBlock: 'loose',
  caseStudyTransition: 'default',
  richTransition: 'default',
  featureHeadingOffset: 'default',
  // featureImageStatement is conditional; see sectionSpacingFor().
}

const sectionSpacingFor = (block: LayoutBlock): SectionBlockSpacing | undefined => {
  if (block.blockType === 'featureImageStatement') {
    return block.imageWidth === 'full' ? 'loose' : 'default'
  }
  return block.blockType ? SPACING_MAP[block.blockType] : undefined
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

/**
 * The block slugs a collection's Section accepts, read from the sanitized
 * Payload config: the `layout` field's `section` block, then its nested list.
 */
const nestableSlugs = (sanitized: SanitizedConfig, collection: CollectionSlug): Set<string> => {
  const fields = sanitized.collections.find((entry) => entry.slug === collection)?.fields ?? []
  const section = blocksOf(findField(fields, 'layout')).find((block) => block.slug === SECTION_SLUG)
  const children = blocksOf(section && findField(section.fields, SECTION_CHILDREN_FIELD))
  return new Set(children.map((block) => block.slug))
}

/** A nested block renders bare: only the Section's theme applies. */
const resetNestedTheme = (block: LayoutBlock): LayoutBlock =>
  'theme' in block && block.theme !== DEFAULT_THEME ? { ...block, theme: DEFAULT_THEME } : block

const wrapInSection = (block: LayoutBlock, spacing: SectionBlockSpacing): LayoutBlock => {
  const theme = normalizeTheme(block.theme) ?? DEFAULT_THEME
  return {
    blockType: SECTION_SLUG,
    customize: theme !== DEFAULT_THEME || spacing !== 'default',
    theme,
    spacing,
    [SECTION_CHILDREN_FIELD]: [resetNestedTheme(block)],
  }
}

const tidySection = (section: LayoutBlock): LayoutBlock => {
  const children = (section[SECTION_CHILDREN_FIELD] as LayoutBlock[] | undefined) ?? []
  return {
    ...section,
    theme: normalizeTheme(section.theme) ?? DEFAULT_THEME,
    [SECTION_CHILDREN_FIELD]: children.map(resetNestedTheme),
  }
}

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
): { changed: boolean; next: LayoutBlock[] } => {
  const next = layout.map((block) => {
    if (!block.blockType) return block
    if (block.blockType === SECTION_SLUG) return tidySection(block)
    const spacing = sectionSpacingFor(block)
    if (spacing === undefined || !nestable.has(block.blockType)) return block
    return wrapInSection(block, spacing)
  })
  return { changed: JSON.stringify(next) !== JSON.stringify(layout), next }
}

const themeTag = (block: LayoutBlock) =>
  block.theme && block.theme !== DEFAULT_THEME ? `(${String(block.theme)})` : ''

const describe = (layout: LayoutBlock[]) =>
  layout
    .map((block) =>
      block.blockType === SECTION_SLUG
        ? `section${themeTag(block)}[${((block[SECTION_CHILDREN_FIELD] as LayoutBlock[]) ?? [])
            .map((child) => `${child.blockType}${themeTag(child)}`)
            .join(', ')}]`
        : `${block.blockType}${themeTag(block)}`,
    )
    .join(' · ')

const run = async () => {
  const dryRun = process.argv.includes('--dry-run')
  const restoreIndex = process.argv.indexOf('--restore')
  const restoreFile = restoreIndex === -1 ? null : process.argv[restoreIndex + 1]
  if (restoreIndex !== -1 && !restoreFile) {
    throw new Error('--restore needs the snapshot file path')
  }

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
        data: { layout: normalizeLayout(entry.layout) as never },
        draft: false,
        depth: 0,
        context,
      })
      payload.logger.info(`restored ${entry.collection}/${entry.id}`)
    }
    payload.logger.info(`Restored ${snapshot.length} documents from ${restoreFile}`)
    return
  }

  const snapshot: {
    collection: string
    id: number | string
    slug?: unknown
    layout: LayoutBlock[]
  }[] = []
  let updated = 0

  for (const collection of COLLECTIONS) {
    const nestable = nestableSlugs(payload.config, collection)
    const { docs } = await payload.find({
      collection,
      draft: true,
      depth: 0,
      limit: 200,
      pagination: false,
    })

    for (const doc of docs as Array<{
      id: number | string
      slug?: unknown
      layout?: LayoutBlock[] | null
      _status?: 'draft' | 'published' | null
    }>) {
      const layout = doc.layout ?? []
      snapshot.push({ collection, id: doc.id, slug: doc.slug, layout })

      const { changed, next } = transformLayout(normalizeLayout(layout), nestable)
      if (!changed) {
        payload.logger.info(`unchanged ${collection}/${String(doc.slug ?? doc.id)}`)
        continue
      }

      // A document whose latest version is a draft (unpublished edits, or
      // never published) is saved as a draft: the run must not publish
      // someone's work in progress. Its live version keeps the old layout,
      // which still renders, until an editor publishes.
      const asDraft = doc._status === 'draft'
      payload.logger.info(
        `${dryRun ? '[dry-run] ' : ''}${collection}/${String(doc.slug ?? doc.id)}${asDraft ? ' (draft)' : ''}\n  before: ${describe(layout)}\n  after:  ${describe(next)}`,
      )

      if (dryRun) continue

      await payload.update({
        collection,
        id: doc.id,
        data: { layout: next as never },
        draft: asDraft,
        depth: 0,
        context,
      })
      updated += 1
    }
  }

  if (!dryRun) {
    const dir = path.resolve('scripts/snapshots')
    fs.mkdirSync(dir, { recursive: true })
    const file = path.join(
      dir,
      `wrap-sections-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    )
    fs.writeFileSync(file, JSON.stringify(snapshot, null, 2))
    payload.logger.info(`Updated ${updated} documents. Snapshot: ${file}`)
    payload.logger.info(
      'Revalidation was skipped (disableRevalidate); revalidate or redeploy the site to serve the new layouts.',
    )
  } else {
    payload.logger.info('Dry run complete; nothing written.')
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
