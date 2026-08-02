import type { SplitImageOffsetBlock as SplitImageOffsetBlockType } from '@/payload-types'
import { SplitImageOffset } from './SplitImageOffset'

export const SplitImageOffsetBlock = (
  props: SplitImageOffsetBlockType & { disableInnerContainer?: boolean },
) => {
  const { largeMedia, smallMedia } = props
  if (typeof largeMedia !== 'object' || !largeMedia) return null
  if (typeof smallMedia !== 'object' || !smallMedia) return null
  return (
    <SplitImageOffset block={props} content={props.body} large={largeMedia} small={smallMedia} />
  )
}
