/**
 * Media references held by a page's block layout, for the publish gates.
 *
 * Every upload field on a layout block ends in "media" (media, portraitMedia,
 * largeMedia, posterMedia inside a shader group, …); non-upload matches like
 * `browseAllMedia` are booleans and fall out of the later `relationshipIds`
 * pass. Carousel `slides[].media` and Section `blocks[]` are walked
 * explicitly, so a block nested in a Section is gated like a top-level one.
 * Hidden but retained references (an upload kept beside a shader choice) are
 * included on purpose: the established policy validates what is stored.
 */
type BlockLike = Record<string, unknown>

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

export const collectVisualMediaRefs = (layout: unknown): unknown[] => {
  if (!Array.isArray(layout)) return []
  return layout.flatMap((entry): unknown[] => {
    if (!entry || typeof entry !== 'object') return []
    const block = entry as BlockLike
    const own = [...mediaKeys(block), ...shaderPosters(block)]
    const slides = Array.isArray(block.slides)
      ? (block.slides as BlockLike[]).flatMap((slide) => (slide?.media ? [slide.media] : []))
      : []
    const nested = Array.isArray(block.blocks) ? collectVisualMediaRefs(block.blocks) : []
    return [...own, ...slides, ...nested]
  })
}
