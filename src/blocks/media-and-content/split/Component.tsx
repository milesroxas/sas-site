import { resolveVisual } from '@/features/immersive/visual'
import type { SplitBlock as SplitBlockType } from '@/payload-types'
import { SplitView } from './SplitView'

/**
 * Adapter for the flat `{...block}` render map (Pages and other generic
 * collections). No canonical Case Study context here, so content is always the
 * inline `body`. `bare` is forwarded for callers whose shell owns the band
 * (the Section block).
 */
export const SplitBlock = (
  props: SplitBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => {
  const visual = resolveVisual(props, { seedKey: props.id ?? undefined })
  if (!visual) return null
  return <SplitView bare={props.bare} block={props} content={props.body} visual={visual} />
}
