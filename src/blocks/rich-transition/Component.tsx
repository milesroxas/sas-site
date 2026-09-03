import type React from 'react'
import type { RichTransitionBlock as RichTransitionBlockData } from '@/payload-types'
import { RichTransition } from './RichTransition'

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or a renderer's reveal band).
 */
type RichTransitionBlockProps = Pick<
  RichTransitionBlockData,
  'blockType' | 'body' | 'eyebrow' | 'heading' | 'layout' | 'theme'
> & { bare?: boolean }

export const RichTransitionBlock: React.FC<RichTransitionBlockProps> = ({
  bare,
  body,
  eyebrow,
  heading,
  layout,
  theme,
}) => (
  <RichTransition
    bare={bare}
    body={body}
    eyebrow={eyebrow}
    heading={heading}
    layout={layout}
    theme={theme}
  />
)
