/**
 * Phase C of docs/blocks-reorg-roadmap.md: wrap the Section-nestable blocks of
 * every composition into `section` blocks, 1:1, preserving each block's
 * surface and rhythm on the Section it now lives in.
 *
 * Policy (kept deliberately mechanical; see the roadmap for why):
 * - Each in-scope top-level block becomes one Section holding exactly that
 *   block. Out-of-scope blocks and existing `section` blocks pass through
 *   untouched, so the script is idempotent.
 * - Section theme comes from the block's `theme` (light → inherit,
 *   neutral → secondary, brand → accent, dark → inverted).
 * - Section spacing restates what the block's renderer hardcoded, so the
 *   band pads the same before and after.
 * - `customize` is set only when theme or spacing differ from the defaults.
 *
 * Known parity caveat: a transition block's band had no bottom padding
 * (`pb-0`), which a Section cannot restate, so a wrapped transition gains the
 * default bottom padding. Production has two such instances; review them in
 * the dry-run and, if wanted, merge each into the following Section by hand
 * afterwards (that is also the better editorial structure).
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/wrap-sections.ts --dry-run
 *   npx tsx --env-file=.env scripts/wrap-sections.ts
 *   npx tsx --env-file=.env scripts/wrap-sections.ts --restore scripts/snapshots/<file>.json
 *
 * Against production, point --env-file at the pulled production env instead,
 * and take a DB backup first. A real run writes a snapshot of every layout it
 * saw to scripts/snapshots/, which --restore replays verbatim.
 */
import fs from 'node:fs'
import path from 'node:path'
import config from '@payload-config'
import { getPayload } from 'payload'
import type { SectionBlockSpacing, SectionBlockTheme } from '@/blocks/section/shared'

const COLLECTIONS = [
  'pages',
  'work-pages',
  'lab-pages',
  'expertise-pages',
  'audience-pages',
] as const

type LayoutBlock = { blockType?: string; id?: string | null; [key: string]: unknown }

/** Old block-level theme values → Section theme values. */
const THEME_MAP: Record<string, SectionBlockTheme> = {
  light: 'inherit',
  neutral: 'secondary',
  brand: 'accent',
  dark: 'inverted',
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
  labTransition: 'default',
  featureHeadingOffset: 'default',
  // featureImageStatement is conditional; see sectionSpacingFor().
}

const sectionSpacingFor = (block: LayoutBlock): SectionBlockSpacing | undefined => {
  if (block.blockType === 'featureImageStatement') {
    return block.imageWidth === 'full' ? 'loose' : 'default'
  }
  return block.blockType ? SPACING_MAP[block.blockType] : undefined
}

const wrapInSection = (block: LayoutBlock): LayoutBlock => {
  const theme = THEME_MAP[typeof block.theme === 'string' ? block.theme : 'light'] ?? 'inherit'
  const spacing = sectionSpacingFor(block) ?? 'default'
  return {
    blockType: 'section',
    customize: theme !== 'inherit' || spacing !== 'default',
    theme,
    spacing,
    blocks: [block],
  }
}

const transformLayout = (layout: LayoutBlock[]): { changed: boolean; next: LayoutBlock[] } => {
  let changed = false
  const next = layout.map((block) => {
    if (!block.blockType || block.blockType === 'section') return block
    if (sectionSpacingFor(block) === undefined) return block
    changed = true
    return wrapInSection(block)
  })
  return { changed, next }
}

const describe = (layout: LayoutBlock[]) =>
  layout
    .map((block) =>
      block.blockType === 'section'
        ? `section[${((block.blocks as LayoutBlock[]) ?? []).map((child) => child.blockType).join(', ')}]`
        : block.blockType,
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
      collection: (typeof COLLECTIONS)[number]
      id: number
      layout: LayoutBlock[]
    }[] = JSON.parse(fs.readFileSync(restoreFile, 'utf8'))
    for (const entry of snapshot) {
      await payload.update({
        collection: entry.collection,
        id: entry.id,
        data: { layout: entry.layout as never },
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
    }>) {
      const layout = doc.layout ?? []
      snapshot.push({ collection, id: doc.id, slug: doc.slug, layout })

      const { changed, next } = transformLayout(layout)
      if (!changed) {
        payload.logger.info(`unchanged ${collection}/${String(doc.slug ?? doc.id)}`)
        continue
      }

      payload.logger.info(
        `${dryRun ? '[dry-run] ' : ''}${collection}/${String(doc.slug ?? doc.id)}\n  before: ${describe(layout)}\n  after:  ${describe(next)}`,
      )

      if (dryRun) continue

      await payload.update({
        collection,
        id: doc.id,
        data: { layout: next as never },
        // Every touched doc is published with drafts identical to the
        // published version (verified in the roadmap audit); publishing keeps
        // that parity. Re-check before running if content has moved on.
        draft: false,
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
