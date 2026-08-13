import type { FullMediaBlock as FullMediaBlockType } from '@/payload-types'
import { FullMedia } from './FullMedia'

/**
 * Adapter for the flat `{...block}` render map (Pages and other generic
 * collections). No canonical Case Study context here, so content is always the
 * inline `body`.
 */
export const FullMediaBlock = (props: FullMediaBlockType & { disableInnerContainer?: boolean }) => {
  const media = props.media
  if (typeof media !== 'object' || !media) return null
  return <FullMedia block={props} content={props.body} media={media} />
}
