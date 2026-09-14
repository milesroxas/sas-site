import { resolveVisual } from '@/features/immersive/visual'
import type { SplitContentNarrowBlock as SplitContentNarrowBlockType } from '@/payload-types'
import { SplitContentNarrow } from './SplitContentNarrow'

/**
 * Adapter for the flat `{...block}` render map (Pages and other generic
 * collections). No canonical Case Study context here, so content is always the
 * inline `body`. `bare` is forwarded for callers whose shell owns the band
 * (the Section block).
 */
export const SplitContentNarrowBlock = (
  props: SplitContentNarrowBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => {
  const visual = resolveVisual(props, { seedKey: props.id ?? undefined })
  if (!visual) return null
  return <SplitContentNarrow bare={props.bare} block={props} content={props.body} visual={visual} />
}
