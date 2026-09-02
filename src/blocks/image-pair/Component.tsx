import type { ImagePairBlock as ImagePairBlockType } from '@/payload-types'
import { ImagePair } from './ImagePair'

/**
 * Adapter for the flat `{...block}` render map (Pages and other generic
 * collections). No canonical Case Study context here, so content is always the
 * inline `body`. `bare` is forwarded for callers whose shell owns the band
 * (the Section block).
 */
export const ImagePairBlock = (
  props: ImagePairBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => {
  const { landscapeMedia, portraitMedia } = props
  if (typeof portraitMedia !== 'object' || !portraitMedia) return null
  if (typeof landscapeMedia !== 'object' || !landscapeMedia) return null
  return (
    <ImagePair
      bare={props.bare}
      block={props}
      content={props.body}
      landscape={landscapeMedia}
      portrait={portraitMedia}
    />
  )
}
