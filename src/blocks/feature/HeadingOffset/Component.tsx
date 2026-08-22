import type React from 'react'
import RichText from '@/components/RichText'
import type { FeatureHeadingOffsetBlock as FeatureHeadingOffsetBlockData } from '@/payload-types'

type FeatureHeadingOffsetBlockProps = Pick<
  FeatureHeadingOffsetBlockData,
  'blockType' | 'body' | 'eyebrow' | 'heading'
>

export const FeatureHeadingOffsetBlock: React.FC<FeatureHeadingOffsetBlockProps> = ({
  eyebrow,
  heading,
  body,
}) => {
  return (
    <section className="container">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-24">
        <div className="flex flex-col gap-2 lg:col-span-6">
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
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-24" data-reveal>
            <RichText
              className="text-lg text-muted-foreground md:text-xl/6"
              data={body}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
