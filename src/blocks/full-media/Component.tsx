import type { FullMediaBlock as FullMediaBlockType } from '@/payload-types'
import { FullMedia } from './FullMedia'

/**
 * Adapter for the flat `{...block}` render map (Pages and other generic
 * collections). No canonical Case Study context here, so content is always the
 * inline `body`. `bare` is forwarded for callers whose shell owns the band
 * (the Section block).
 */
export const FullMediaBlock = (
  props: FullMediaBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => {
  const media = props.media
  if (typeof media !== 'object' || !media) return null
  return <FullMedia bare={props.bare} block={props} content={props.body} media={media} />
}
