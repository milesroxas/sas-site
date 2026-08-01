import type { ImagePairBlock as ImagePairBlockType } from '@/payload-types'
import { ImagePair } from './ImagePair'

export const ImagePairBlock = (props: ImagePairBlockType & { disableInnerContainer?: boolean }) => {
  const { landscapeMedia, portraitMedia } = props
  if (typeof portraitMedia !== 'object' || !portraitMedia) return null
  if (typeof landscapeMedia !== 'object' || !landscapeMedia) return null
  return (
    <ImagePair
      block={props}
      content={props.body}
      landscape={landscapeMedia}
      portrait={portraitMedia}
    />
  )
}
