/**
 * Media references held by a page's block layout, for the publish gates.
 *
 * Every upload field on a layout block ends in "media" (media, portraitMedia,
 * largeMedia, posterMedia inside a shader group, …); non-upload matches like
 * `browseAllMedia` are booleans and fall out of the later `relationshipIds`
 * pass. Repeating rows (carousel `slides[]`, the tabs blocks' `tabs[]`) are
 * walked with the same rules, and Section `blocks[]` recurse, so a block
 * nested in a Section is gated like a top-level one. Hidden but retained
 * references (an upload kept beside a shader choice) are included on
 * purpose: the established policy validates what is stored.
 */
type BlockLike = Record<string, unknown>

/** The repeating fields whose rows carry their own media or visual slot. */
const ROW_KEYS = ['slides', 'tabs'] as const

const mediaKeys = (block: BlockLike): unknown[] =>
  Object.entries(block).flatMap(([key, value]) => {
    if (!/media$/i.test(key) || !value) return []
    return Array.isArray(value) ? value : [value]
  })

const shaderPosters = (block: BlockLike): unknown[] => {
  const shader = block.shader
  if (!shader || typeof shader !== 'object') return []
  const poster = (shader as { posterMedia?: unknown }).posterMedia
  return poster ? [poster] : []
}

/** A block's, or a row's, own references: media-suffixed fields and its shader poster. */
const ownRefs = (node: BlockLike): unknown[] => [...mediaKeys(node), ...shaderPosters(node)]

const rowRefs = (block: BlockLike): unknown[] =>
  ROW_KEYS.flatMap((key) => {
    const rows = block[key]
    if (!Array.isArray(rows)) return []
    return rows.flatMap((row) => (row && typeof row === 'object' ? ownRefs(row as BlockLike) : []))
  })

export const collectVisualMediaRefs = (layout: unknown): unknown[] => {
  if (!Array.isArray(layout)) return []
  return layout.flatMap((entry): unknown[] => {
    if (!entry || typeof entry !== 'object') return []
    const block = entry as BlockLike
    const nested = Array.isArray(block.blocks) ? collectVisualMediaRefs(block.blocks) : []
    return [...ownRefs(block), ...rowRefs(block), ...nested]
  })
}
