import type React from 'react'
import type { FeatureHeadingOffsetBlock as FeatureHeadingOffsetBlockProps } from '@/payload-types'

export const FeatureHeadingOffsetBlock: React.FC<FeatureHeadingOffsetBlockProps> = ({
  eyebrow,
  heading,
  body,
}) => {
  return (
    <section className="container">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-24">
        <div className="flex flex-col gap-2 lg:col-span-6">
          {eyebrow ? <p className="text-sm tracking-widest uppercase">{eyebrow}</p> : null}
          <h2 className="text-4xl leading-[1.2] md:text-5xl md:leading-[1.2]">{heading}</h2>
        </div>
        <p className="text-lg whitespace-pre-line text-muted-foreground md:text-xl/6 lg:col-span-4 lg:col-start-9 lg:pt-24">
          {body}
        </p>
      </div>
    </section>
  )
}
