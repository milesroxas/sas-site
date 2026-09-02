import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import RichText from '@/components/RichText'
import type { FeatureHeadingOffsetBlock as FeatureHeadingOffsetBlockData } from '@/payload-types'

/**
 * `bare` skips the themed band for callers that supply their own themed shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 */
type FeatureHeadingOffsetBlockProps = Pick<
  FeatureHeadingOffsetBlockData,
  'blockType' | 'body' | 'bodySize' | 'eyebrow' | 'heading' | 'theme'
> & { bare?: boolean }

/** Editor-chosen type size of the supporting copy; `medium` is the original treatment. */
const BODY_SIZE_CLASS: Record<NonNullable<FeatureHeadingOffsetBlockData['bodySize']>, string> = {
  small: 'text-base text-muted-foreground md:text-lg/6',
  medium: 'text-lg text-muted-foreground md:text-xl/6',
  large: 'text-xl text-muted-foreground md:text-2xl/8',
}

export const FeatureHeadingOffsetBlock: React.FC<FeatureHeadingOffsetBlockProps> = ({
  eyebrow,
  heading,
  body,
  bodySize,
  bare,
  theme,
}) => {
  return (
    <Section bare={bare} theme={theme}>
      <div className="container">
        <BlockGrid>
          <div className="text-stack md:col-span-4">
            {eyebrow ? (
              <p className="text-sm tracking-widest uppercase" data-reveal>
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-heading-2" data-reveal>
              {heading}
            </h2>
          </div>
          {body ? (
            <div className="md:col-span-3 md:col-start-6 md:pt-24" data-reveal>
              <RichText
                className={BODY_SIZE_CLASS[bodySize ?? 'medium']}
                data={body}
                enableGutter={false}
                enableProse={false}
              />
            </div>
          ) : null}
        </BlockGrid>
      </div>
    </Section>
  )
}
