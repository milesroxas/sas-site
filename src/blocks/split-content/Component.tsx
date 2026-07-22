import type { SplitContentNarrowBlock as SplitContentNarrowBlockType } from '@/payload-types'
import { SplitContentNarrow } from './SplitContentNarrow'

/**
 * Adapter for the flat `{...block}` render map (Pages and other generic
 * collections). No canonical Case Study context here, so content is always the
 * inline `body`.
 */
export const SplitContentNarrowBlock = (
  props: SplitContentNarrowBlockType & { disableInnerContainer?: boolean },
) => {
  const media = props.media
  if (typeof media !== 'object' || !media) return null
  return <SplitContentNarrow block={props} content={props.body} media={media} />
}
