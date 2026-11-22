import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName } from '@/blocks/shared/typography'
import RichText from '@/components/RichText'
import type { FeatureHeadingOffsetBlock as FeatureHeadingOffsetBlockData } from '@/payload-types'

/**
 * `bare` skips the themed band for callers that supply their own themed shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 */
type FeatureHeadingOffsetBlockProps = Pick<
  FeatureHeadingOffsetBlockData,
  'blockType' | 'body' | 'eyebrow' | 'heading' | 'theme'
> & { bare?: boolean }

export const FeatureHeadingOffsetBlock: React.FC<FeatureHeadingOffsetBlockProps> = ({
  eyebrow,
  heading,
  body,
  bare,
  theme,
}) => {
  return (
    <Section bare={bare} theme={theme}>
      <div className="container">
        <BlockGrid>
          <div className="text-stack md:col-span-4">
            {eyebrow ? (
              <p className={eyebrowClassName} data-reveal>
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-heading" data-reveal>
              {heading}
            </h2>
          </div>
          {body ? (
            <div className="md:col-span-3 md:col-start-6 md:pt-24" data-reveal>
              <RichText
                className="text-lead text-muted-foreground"
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
