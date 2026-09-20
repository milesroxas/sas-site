import type React from 'react'
import type { RichTransitionBlock as RichTransitionBlockData } from '@/payload-types'
import { RichTransition } from './RichTransition'

/**
 * `bare` skips the themed band for callers that supply their own shell. Every
 * renderer that mounts this component sets it for exactly one case, a block
 * nested in a Section block, so it is also the signal that the Section's
 * stack owns the gap below a Prose opener (`stacked`).
 */
type RichTransitionBlockProps = Pick<
  RichTransitionBlockData,
  'blockType' | 'body' | 'eyebrow' | 'heading' | 'headingLevel' | 'layout' | 'theme'
> & { bare?: boolean }

export const RichTransitionBlock: React.FC<RichTransitionBlockProps> = ({
  bare,
  body,
  eyebrow,
  heading,
  headingLevel,
  layout,
  theme,
}) => (
  <RichTransition
    bare={bare}
    stacked={bare}
    body={body}
    eyebrow={eyebrow}
    heading={heading}
    headingLevel={headingLevel}
    layout={layout}
    theme={theme}
  />
)
