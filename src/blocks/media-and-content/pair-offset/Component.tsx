import type { PairOffsetBlock as PairOffsetBlockType } from '@/payload-types'
import { PairOffsetView } from './PairOffsetView'

/**
 * Adapter for the flat `{...block}` render map (Pages and other generic
 * collections). No canonical Case Study context here, so content is always the
 * inline `body`. `bare` is forwarded for callers whose shell owns the band
 * (the Section block).
 */
export const PairOffsetBlock = (
  props: PairOffsetBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => {
  const { largeMedia, smallMedia } = props
  if (typeof largeMedia !== 'object' || !largeMedia) return null
  if (typeof smallMedia !== 'object' || !smallMedia) return null
  return (
    <PairOffsetView
      bare={props.bare}
      block={props}
      content={props.body}
      large={largeMedia}
      small={smallMedia}
    />
  )
}
